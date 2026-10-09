sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("cti.widget.controller.App", {

        onInit: function () {

            const oModel = new JSONModel({
                connected: false,
                hasCall: false,
                callId: "",
                caller: "",
                callee: "",
                direction: "",
                event: "WAITING"
            });

            this.getView().setModel(oModel);

            this._connectWebSocket();
        },

        _connectWebSocket: function () {

            const socket = new WebSocket("ws://localhost:4004/ws/cti");

            socket.addEventListener("open", () => {

                console.log("✅ CTI WebSocket connected");

                this.getView().getModel().setProperty(
                    "/connected",
                    true
                );

            });

            socket.addEventListener("message", (message) => {

                console.log("📨 CTI event received:");
                console.log(message.data);

                const messageData = JSON.parse(message.data);

                if (messageData.event !== "callEvent") {
                    return;
                }

                const call = messageData.data;

                // Converts the Sales Cloud payload object into XML.
                const salesCloudPayload = this._mapToSalesCloudPayload(call);

                const xml = this._toXml(salesCloudPayload);

                console.log("📦 Sales Cloud payload:");
                console.log(salesCloudPayload);

                console.log("📄 Sales Cloud XML:");
                console.log(xml);

                // Send the CTI payload only to the trusted parent origin.
                window.parent.postMessage(
                    xml,
                    window.location.origin
                );

                this.getView().getModel().setData({
                    connected: true,
                    hasCall: true,
                    callId: call.callId,
                    caller: call.caller,
                    callee: call.callee,
                    direction: call.direction,
                    event: call.event
                });

            });

            socket.addEventListener("close", () => {

                console.log("❌ CTI WebSocket disconnected");

                this.getView().getModel().setProperty(
                    "/connected",
                    false
                );

            });

            socket.addEventListener("error", (error) => {

                console.error(
                    "⚠️ CTI WebSocket error:",
                    error
                );

            });

        },
        // send command for Answer and End the call
        _sendCommand: async function (command) {
            const model = this.getView().getModel();

            const callId = model.getProperty("/callId");

            if (!callId) {
                console.error("❌ No active call")
                return;
            }

            try {
                const response = await fetch(
                    "/odata/v4/cti/sendCommand",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            callId: callId,
                            command: command
                        })
                    }
                );

                const result = await response.json();

                console.log("📞 Command response:", result);

            } catch (error) {
                console.error("❌ Failed to send CTI command:", error);
            }
        },

        //Button Answer
        onAnswer: function () {
            this._sendCommand("ANSWER");
        },

        //Button End call
        onEnd: function () {
            this._sendCommand("END");
        },

        //for sales cloud simulator embed
        _mapToSalesCloudPayload: function (call) {

            const event = (call.event || "").toUpperCase();
            const direction = (call.direction || "").toUpperCase();

            let eventType = direction === "OUTBOUND"
                ? "OUTBOUND"
                : "INBOUND";

            let action = "NOTIFY";

            switch (event) {

                case "ANSWERED":
                    action = "ACCEPT";
                    break;

                case "ENDED":
                    action = "END";
                    eventType = "UPDATEACTIVITY";
                    break;

            }

            return {
                Type: "CALL",
                EventType: eventType,
                Action: action,
                ANI: call.caller || "",
                ExternalReferenceID: call.callId || ""
            };
        },

        // Converts the Sales Cloud payload object into readable XML.
        _toXml: function (payload) {

            let xml = "<payload>\n";

            Object.entries(payload).forEach(([key, value]) => {
                xml += `    <${key}>${value}</${key}>\n`;
            });

            xml += "</payload>";

            return xml;
        },

    });
});