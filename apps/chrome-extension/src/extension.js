const API_URL = "https://tools-api.galadrim.fr";

const REFRESH_INTERVAL = 1000;

const MONTH_NUMBERS = {
    janvier: 1,
    février: 2,
    mars: 3,
    avril: 4,
    mai: 5,
    juin: 6,
    juillet: 7,
    août: 8,
    septembre: 9,
    octobre: 10,
    novembre: 11,
    décembre: 12,
    january: 1,
    february: 2,
    march: 3,
    april: 4,
    may: 5,
    june: 6,
    july: 7,
    august: 8,
    september: 9,
    october: 10,
    november: 11,
    december: 12,
};

const lastLoopData = {};

setInterval(() => {
    updateExtensionUi();
}, REFRESH_INTERVAL);

function updateExtensionUi() {
    chrome.storage.sync.get("galadrimToolsApiToken", (items) => {
        lastLoopData.apiToken = items.galadrimToolsApiToken;
    });

    if (!lastLoopData.apiToken) return;

    const dates = getDates();

    if (!dates) return;

    const dateChanged =
        dates.startIso !== lastLoopData.startIso || dates.endIso !== lastLoopData.endIso;

    const stopExecution = !dateChanged && roomSelectIsInDom();

    if (stopExecution) return;

    lastLoopData.startIso = dates.startIso;
    lastLoopData.endIso = dates.endIso;

    displayAvailableRooms(dates.startIso, dates.endIso);
}

/** @returns {Promise<{ id: number; name: string; officeId: number }[]>} */
async function getRooms(start, end) {
    const res = await fetch(`${API_URL}/availableRooms?start=${start}&end=${end}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${lastLoopData.apiToken}`,
        },
    });

    return res.json();
}

function getHoursMinutes(str) {
    const [hoursStr, minutesAndAmPm] = str.split(":");
    const amPm = minutesAndAmPm.slice(-2).toLowerCase();
    const minutes = minutesAndAmPm.slice(0, 2);
    const hours = +hoursStr % 12;

    if (amPm === "pm") {
        return { hours: hours + 12, minutes };
    }

    return { hours, minutes };
}

function getDates() {
    const startDate = document.querySelector("[data-key=startDate]");
    const startTime = document.querySelector("[data-key=startTime]");
    const endTime = document.querySelector("[data-key=endTime]");

    if (!startDate || !startTime || !endTime) return null;

    // startDate looks like this: Mercredi, 8 novembre [2024]
    // We want to extract the date from it
    const startDateText = startDate.innerText.split(", ")[1]; // 8 novembre
    const spaceSplit = startDateText.split(" ");
    const day = spaceSplit[0];
    const monthText = spaceSplit[1];
    const month = MONTH_NUMBERS[monthText.toLowerCase()];
    const year = spaceSplit.length === 2 ? new Date().getFullYear() : spaceSplit[2];

    const { hours: startHours, minutes: startMinutes } = getHoursMinutes(startTime.innerText);
    const { hours: endHours, minutes: endMinutes } = getHoursMinutes(endTime.innerText);

    const monthStr = month.toString().padStart(2, "0");
    const dayStr = day.toString().padStart(2, "0");
    const startHoursStr = startHours.toString().padStart(2, "0");
    const startMinutesStr = startMinutes.toString().padStart(2, "0");
    const endHoursStr = endHours.toString().padStart(2, "0");
    const endMinutesStr = endMinutes.toString().padStart(2, "0");

    const parsedStartDate = `${year}-${monthStr}-${dayStr}T${startHoursStr}:${startMinutesStr}`;
    const parsedEndDate = `${year}-${monthStr}-${dayStr}T${endHoursStr}:${endMinutesStr}`;

    const startIso = new Date(parsedStartDate).toISOString();
    const endIso = new Date(parsedEndDate).toISOString();

    return { startIso, endIso };
}

function getSubmitButton() {
    const spans = document.querySelector("div[role=dialog]").querySelectorAll("button > span");

    const submitButton = Array.from(spans).find((span) => span.innerText === "Enregistrer");

    return submitButton ?? null;
}

function getTitleValue() {
    const titleInput = document.querySelector("div[role=dialog]").querySelector("input");
    if (!titleInput) return null;
    return titleInput.value;
}

function roomSelectIsInDom() {
    const roomSelect = document.getElementById("room-select-container");

    return !!roomSelect;
}

/**
 * @param {string} start
 * @param {string} end
 */
async function displayAvailableRooms(start, end) {
    const availableRooms = await getRooms(start, end);
    const locationDiv = document.querySelector("[data-key=location]");

    let select = document.getElementById("room-select");

    if (!select) {
        const listContainer = document.createElement("div");

        listContainer.style.margin = "10px";
        listContainer.style.marginLeft = "66px";

        listContainer.id = "room-select-container";
        const parent =
            locationDiv.parentElement.parentElement.parentElement.parentElement.parentElement
                .parentElement.parentElement;
        parent.appendChild(listContainer);
        const lab = document.createElement("label");
        lab.htmlFor = "room-select";
        lab.innerText = "Choisir une salle";

        lab.style.marginRight = "10px";

        select = document.createElement("select");
        select.id = "room-select";

        listContainer.appendChild(lab);
        listContainer.appendChild(select);

        select.addEventListener("change", (e) => {
            locationDiv.click();
            setTimeout(() => {
                const locationInput = parent.getElementsByTagName("input")[0];
                const roomId = e.target.value;
                const room = availableRooms.find((room) => room.id.toString() === roomId);

                locationInput.value = room.name;
                locationInput.dispatchEvent(new Event("change"));
            }, 100);
        });

        getSubmitButton()?.addEventListener("click", () => {
            const roomId = select.value?.toString();

            if (!roomId) return;

            const roomFound = availableRooms.find((room) => room.id.toString() === roomId);

            if (roomFound) {
                const title = getTitleValue();

                createEvent({
                    start,
                    end,
                    roomId: roomFound.id,
                    officeId: roomFound.officeId,
                    title,
                });
            }
        });
    }

    const prevValue = select.value;

    const options = availableRooms.map((room) => {
        const opt = document.createElement("option");
        opt.value = room.id.toString();
        opt.innerText = room.name;
        return opt;
    });

    select.innerHTML = `<option value="">--Choisir une salle--</option>`;

    options.forEach((opt) => select.appendChild(opt));

    select.value = prevValue;
}

/**
 * @param {{start: string; end: string; roomId: number; officeId: number; title: string}} params
 */
async function createEvent({ start, end, roomId, officeId, title }) {
    const formData = new FormData();
    formData.append("start", start);
    formData.append("end", end);
    formData.append("officeRoomId", roomId);

    if (title) {
        formData.append("title", title);
    }

    await fetch(`${API_URL}/offices/${officeId}/reservations`, {
        headers: {
            Authorization: `Bearer ${lastLoopData.apiToken}`,
        },
        method: "POST",
        body: formData,
    });
}
