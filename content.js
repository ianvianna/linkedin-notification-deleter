if (!globalThis.linkedinNotificationDeleterRunning) {
  globalThis.linkedinNotificationDeleterRunning = true;

  (async function deleteNotifications() {
    const delay = (milliseconds) =>
      new Promise((resolve) => setTimeout(resolve, milliseconds));

    const lang = (document.documentElement.lang || "pt").toLowerCase().slice(0, 2);
    const i18n = {
      pt: {
        menuTerms: ["configurações", "menu"],
        deleteTerms: ["excluir notificação", "excluir"]
      },
      en: {
        menuTerms: ["settings", "menu"],
        deleteTerms: ["delete notification", "delete"]
      }
    };

    const currentRules = i18n[lang] || i18n.pt;
    let deletedCount = 0;

    console.log(`[LinkedIn Notification Deleter] Detected language: "${lang.toUpperCase()}".`);

    try {
      while (true) {
        const menuButtons = Array.from(
          document.querySelectorAll("button[aria-label], .nt-card__settings-dropdown")
        ).filter((button) => {
          const label = (button.getAttribute("aria-label") || "").toLowerCase();
          return currentRules.menuTerms.some((term) => label.includes(term));
        });

        if (menuButtons.length === 0) {
          console.log("[LinkedIn Notification Deleter] No more notifications found.");
          break;
        }

        for (const menuButton of menuButtons) {
          menuButton.click();
          await delay(400);

          const openDropdown = document.querySelector(
            ".artdeco-dropdown__content--is-open"
          );

          const deleteButton = openDropdown
            ? Array.from(
                openDropdown.querySelectorAll(
                  "button.nt-card-settings-dropdown-item__button"
                )
              ).find((button) => {
                const hasTrashIcon =
                  button.querySelector('svg[data-test-icon="trash-medium"]') !== null;
                const headlineText = (
                  button.querySelector(".nt-card-settings-dropdown-item__headline")
                    ?.innerText || ""
                )
                  .trim()
                  .toLowerCase();
                const hasDeleteText = currentRules.deleteTerms.some((term) =>
                  headlineText.includes(term)
                );

                return hasTrashIcon && hasDeleteText;
              })
            : null;

          if (deleteButton) {
            deleteButton.click();
            deletedCount += 1;
            console.log(
              `[LinkedIn Notification Deleter] Notification deleted (#${deletedCount}).`
            );
            await delay(600);
            continue;
          }

          document.body.click();
          await delay(300);
        }

        window.scrollTo(0, document.body.scrollHeight);
        await delay(1500);
      }
    } finally {
      globalThis.linkedinNotificationDeleterRunning = false;
      console.log(
        `[LinkedIn Notification Deleter] Process completed: ${deletedCount} notification(s) deleted.`
      );
    }
  })();
} else {
  console.log("[LinkedIn Notification Deleter] A deletion is already in progress.");
}
