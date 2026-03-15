/* eslint-disable no-undef */
async function loadApp() {
    try {
        await import('./index.js');
    } catch (error) {
        console.error("Error starting app:", error);
    }
}
loadApp();
