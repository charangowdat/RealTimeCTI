(function () {
    "use strict";

    const widgetFrame = document.getElementById("ctiWidget");
    const widgetStatus = document.getElementById("widgetStatus");
    const simulateButton = document.getElementById("simulateIncoming");
    const triggerStatus = document.getElementById("triggerStatus");
    const emptyState = document.getElementById("emptyState");
    const payloadContent = document.getElementById("payloadContent");
    const eventLog = document.getElementById("eventLog");
    let messageTotal = 0;

    widgetFrame.addEventListener("load", function () {
        widgetStatus.classList.add("ready");
        widgetStatus.classList.remove("waiting");
        widgetStatus.innerHTML = '<span class="status-dot"></span> Widget loaded';
    });

    widgetFrame.addEventListener("error", function () {
        widgetStatus.classList.remove("ready");
        widgetStatus.classList.add("waiting");
        widgetStatus.innerHTML = '<span class="status-dot"></span> Could not load widget';
    });

    window.addEventListener("message", function (event) {
        if (event.source !== widgetFrame.contentWindow || typeof event.data !== "string") {
            return;
        }

        const parsed = parsePayload(event.data);
        if (!parsed) {
            return;
        }

        messageTotal += 1;
        document.getElementById("messageCount").textContent =
            messageTotal + (messageTotal === 1 ? " message" : " messages");
        document.getElementById("fieldType").textContent = parsed.Type;
        document.getElementById("fieldEventType").textContent = parsed.EventType;
        document.getElementById("fieldAction").textContent = parsed.Action;
        document.getElementById("fieldAni").textContent = parsed.ANI;
        document.getElementById("fieldReference").textContent = parsed.ExternalReferenceID;
        document.getElementById("rawPayload").textContent = event.data;
        document.getElementById("receivedAt").textContent = new Date().toLocaleTimeString();

        emptyState.hidden = true;
        payloadContent.hidden = false;

        const placeholder = document.getElementById("logPlaceholder");
        if (placeholder) {
            placeholder.remove();
        }

        const item = document.createElement("li");
        item.className = "event-item";
        const top = document.createElement("div");
        top.className = "event-item-top";
        const name = document.createElement("span");
        name.className = "event-name";
        name.textContent = parsed.EventType;
        const time = document.createElement("span");
        time.className = "event-time";
        time.textContent = new Date().toLocaleTimeString();
        const meta = document.createElement("div");
        meta.className = "event-meta";
        meta.textContent = parsed.ANI + " · " + parsed.ExternalReferenceID;
        top.append(name, time);
        item.append(top, meta);
        eventLog.prepend(item);

        while (eventLog.children.length > 6) {
            eventLog.lastElementChild.remove();
        }
    });

    simulateButton.addEventListener("click", async function () {
        simulateButton.disabled = true;
        triggerStatus.className = "trigger-status";
        triggerStatus.textContent = "Sending a sample incoming call to CAP…";

        try {
            const response = await fetch("/odata/v4/cti/notifyEvent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    callId: "CALL-00002",
                    caller: "+919876543210",
                    callee: "+918765432100",
                    direction: "INBOUND",
                    event: "INCOMING"
                })
            });

            const result = await response.json().catch(function () { return {}; });
            if (!response.ok) {
                const message = (result.error && result.error.message) ||
                    result.message || "CAP rejected the sample call";
                throw new Error(message);
            }

            triggerStatus.className = "trigger-status success";
            triggerStatus.textContent =
                "Incoming call sent. The widget should forward its XML notification here.";
        } catch (error) {
            triggerStatus.className = "trigger-status error";
            triggerStatus.textContent = "Could not start the sample call: " + error.message;
        } finally {
            simulateButton.disabled = false;
        }
    });

    function parsePayload(xmlText) {
        const xml = new DOMParser().parseFromString(xmlText, "application/xml");
        if (xml.getElementsByTagName("parsererror").length > 0) {
            return null;
        }

        const root = xml.documentElement;
        if (!root || root.tagName.toLowerCase() !== "payload") {
            return null;
        }

        function readTag(name) {
            const node = root.getElementsByTagName(name)[0];
            return node ? node.textContent.trim() : "";
        }

        return {
            Type: readTag("Type"),
            EventType: readTag("EventType"),
            Action: readTag("Action"),
            ANI: readTag("ANI"),
            ExternalReferenceID: readTag("ExternalReferenceID")
        };
    }
}());
