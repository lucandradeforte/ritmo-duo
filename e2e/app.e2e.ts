import { AxeBuilder } from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const selectLucas = async (page: Page) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Lucas/ }).click();
  await expect(
    page.getByRole('heading', { name: 'Pronto para manter o ritmo?' }),
  ).toBeVisible();
};

const startLucasWorkout = async (page: Page) => {
  await selectLucas(page);
  await page.getByRole('button', { name: 'Iniciar treino' }).click();
  await expect(page).toHaveURL(/#\/active$/);
};

const expectNoHorizontalOverflow = async (page: Page) => {
  await expect.poll(async () => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    await page.evaluate(() => window.innerWidth),
  );
};

const expectWeightFormWithinCardAndViewport = async (page: Page) => {
  const weightInput = page.getByLabel('Peso em quilogramas');
  const dateInput = page.getByLabel('Data da pesagem');
  const dateControl = dateInput.locator('xpath=..');
  const submitButton = page.getByRole('button', { name: 'Registrar peso' });
  const weightCard = weightInput.locator('xpath=ancestor::article[1]');

  await expect(weightCard).toBeVisible();
  await expect(weightInput).toBeVisible();
  await expect(dateControl).toBeVisible();
  await expect(submitButton).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await expect.poll(async () => {
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    const bounds = await Promise.all(
      [weightCard, weightInput, dateControl, submitButton].map((locator) =>
        locator.evaluate((element) => {
          const { left, right } = element.getBoundingClientRect();
          return { left, right };
        }),
      ),
    );
    const cardBounds = bounds[0];
    if (!cardBounds) return false;

    return bounds.slice(1).every(
      (controlBounds) =>
        controlBounds !== undefined &&
        controlBounds.left >= cardBounds.left &&
        controlBounds.right <= cardBounds.right &&
        controlBounds.left >= 0 &&
        controlBounds.right <= viewportWidth,
    );
  }).toBe(true);
  await expect.poll(async () => {
    const [weightHeight, dateHeight] = await Promise.all([
      weightInput.evaluate((input) => input.getBoundingClientRect().height),
      dateControl.evaluate((control) => control.getBoundingClientRect().height),
    ]);
    return Math.abs(weightHeight - dateHeight);
  }).toBeLessThanOrEqual(1);
};

test('seleciona um perfil e inicia um treino sem erros no cliente', async ({ page }) => {
  const clientErrors: string[] = [];
  page.on('pageerror', (error) => clientErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') clientErrors.push(message.text());
  });

  await page.goto('/');

  await expect(page).toHaveTitle('Ritmo Duo');
  await expect(page.getByRole('heading', { name: 'Quem está treinando?' })).toBeVisible();

  await page.getByRole('button', { name: /Lucas/ }).click();

  await expect(
    page.getByRole('heading', { name: 'Pronto para manter o ritmo?' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Iniciar treino' }).click();

  await expect(page).toHaveURL(/#\/active$/);
  await expect(page.getByRole('button', { name: 'Voltar' })).toBeVisible();
  await expect(page.getByText(/^Treino [ABC]$/)).toBeVisible();
  expect(clientErrors).toEqual([]);
});

test('mantém o formulário de peso dentro da viewport em telas estreitas', async ({ page }) => {
  await selectLucas(page);
  await page.getByRole('button', { name: 'Progresso' }).click();

  const dateInput = page.getByLabel('Data da pesagem');
  const dateControl = dateInput.locator('xpath=..');
  await expectWeightFormWithinCardAndViewport(page);

  await dateInput.fill('2026-08-28');
  await expect(dateControl).toContainText('28/08/2026');
});

test('mantém o card de peso dentro das larguras mobile prioritárias e nos dois temas', async ({ page }) => {
  const widths = [360, 375, 390, 412, 430];

  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme });

    for (const width of widths) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/');

      const profileSelection = page.getByRole('heading', { name: 'Quem está treinando?' });
      const todayHeading = page.getByRole('heading', { name: 'Pronto para manter o ritmo?' });
      await expect(profileSelection.or(todayHeading)).toBeVisible();
      if (await profileSelection.isVisible()) {
        await page.getByRole('button', { name: /Lucas/ }).click();
      }

      await expect(todayHeading).toBeVisible();
      await expectNoHorizontalOverflow(page);

      await page.getByRole('button', { name: 'Progresso' }).click();
      await expect(page.getByRole('heading', { name: 'Progresso' })).toBeVisible();
      await expectWeightFormWithinCardAndViewport(page);
    }
  }
});

test('não cria scroll artificial no histórico vazio', async ({ page }) => {
  await selectLucas(page);
  await page.getByRole('button', { name: 'Histórico' }).click();

  await expect(page.getByRole('heading', { name: 'Histórico' })).toBeVisible();
  await expect.poll(async () => page.evaluate(() => document.documentElement.scrollHeight)).toBe(
    await page.evaluate(() => document.documentElement.clientHeight),
  );
});

test('mantém a rolagem dentro do conteúdo quando o progresso excede a viewport', async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium-mobile',
    'A rolagem só é esperada quando o conteúdo excede uma viewport mobile.',
  );

  await selectLucas(page);
  await page.getByRole('button', { name: 'Progresso' }).click();

  const content = page.locator('main.app-content');
  await expect.poll(async () => content.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
  await expect.poll(async () => page.evaluate(() => document.documentElement.scrollHeight)).toBe(
    await page.evaluate(() => document.documentElement.clientHeight),
  );

  await content.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect.poll(async () => content.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);

  await page.getByRole('button', { name: 'Histórico' }).click();
  await expect(page.getByRole('heading', { name: 'Histórico' })).toBeVisible();
  await expect.poll(async () => content.evaluate((element) => element.scrollTop)).toBe(0);
});

test('retoma a série registrada após recarregar o aplicativo', async ({ page }) => {
  await startLucasWorkout(page);

  await page.getByLabel('Carga da série 1').fill('10');
  await page.getByLabel('Repetições da série 1').fill('8');
  await page.getByLabel('RIR da série 1').fill('3');
  await page.getByRole('button', { name: 'Concluir série 1' }).click();
  await expect(page.getByRole('button', { name: 'Série 1 concluída' })).toBeVisible();

  await page.reload();
  const recoveryDialog = page.getByRole('dialog', { name: 'Treino em andamento' });
  await expect(recoveryDialog).toBeVisible();
  await recoveryDialog.getByRole('button', { name: 'Continuar treino' }).click();

  await expect(page.getByLabel('Carga da série 1')).toHaveValue('10');
  await expect(page.getByLabel('Repetições da série 1')).toHaveValue('8');
  await expect(page.getByLabel('RIR da série 1')).toHaveValue('3');
  await expect(page.getByRole('button', { name: 'Série 1 concluída' })).toBeVisible();
});

test('mantém as sessões independentes ao alternar o modo dupla', async ({ page }) => {
  await selectLucas(page);
  await page.getByRole('button', { name: 'Iniciar em modo dupla' }).click();
  await expect(page).toHaveURL(/#\/active$/);

  const profileSwitcher = page.getByRole('group', { name: 'Alternar pessoa' });
  const lucasButton = profileSwitcher.getByRole('button', { name: /Lucas/ });
  const geovannaButton = profileSwitcher.getByRole('button', { name: /Geovanna/ });

  await expect(lucasButton).toHaveAttribute('aria-pressed', 'true');
  await page.getByLabel('Carga da série 1').fill('10');
  await page.getByLabel('Repetições da série 1').fill('8');
  await page.getByLabel('RIR da série 1').fill('3');
  await page.getByRole('button', { name: 'Concluir série 1' }).click();

  await geovannaButton.click();
  await expect(geovannaButton).toHaveAttribute('aria-pressed', 'true');
  await expect(lucasButton).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByLabel('Carga da série 1')).toHaveValue('');

  await lucasButton.click();
  await expect(page.getByLabel('Carga da série 1')).toHaveValue('10');
});

test('abre o exemplo do exercício por cima da ficha e retorna à ficha', async ({ page }) => {
  await selectLucas(page);
  await page.getByRole('button', { name: 'Treinos' }).click();
  await page.getByRole('button', { name: 'Ver ficha' }).first().click();

  const workoutDetail = page.getByRole('dialog', { name: /Treino A/ });
  await expect(workoutDetail).toBeVisible();
  await workoutDetail
    .getByRole('button', { name: 'Ver exemplo de execução de Agachamento goblet para banco' })
    .click();

  const exerciseDetail = page.getByRole('dialog', { name: /Agachamento goblet para banco/ });
  await expect(exerciseDetail.getByRole('heading', { name: 'Configuração' })).toBeVisible();
  await exerciseDetail.getByRole('button', { name: 'Fechar' }).click();
  await expect(workoutDetail.getByRole('heading', { name: 'Exercícios e cardio' })).toBeVisible();
});

test('não apresenta violações automatizadas de acessibilidade na tela inicial nos dois temas', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await selectLucas(page);

  const lightResults = await new AxeBuilder({ page }).analyze();
  expect(lightResults.violations).toEqual([]);

  await page.emulateMedia({ colorScheme: 'dark' });
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Pronto para manter o ritmo?' }),
  ).toBeVisible();

  const darkResults = await new AxeBuilder({ page }).analyze();
  expect(darkResults.violations).toEqual([]);
});
