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

        }

    });
});