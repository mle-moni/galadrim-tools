function saveToken() {
    const token = document.getElementById("api-token")?.value;

    if (!token) return;

    chrome.storage.sync.set({ galadrimToolsApiToken: token }, () => {
        document.getElementById("token-infos").innerText = "API token saved";
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("save-api-token");
    if (!button) return;
    button.addEventListener("click", saveToken);
});
