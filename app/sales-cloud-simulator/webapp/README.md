# Sales Cloud V2 Simulator

A local parent-page simulator for the Real-Time CTI widget. It hosts the widget in an iframe, receives XML notifications with window.parent.postMessage(), and displays the parsed values and raw XML.

## Run locally

From the real-time-cti project root, start CAP:

    npm run dev

In a second terminal, start the phone simulator for Answer and End commands:

    node simulator/phone-simulator.js

Open the Sales Cloud simulator at:

    http://localhost:4004/sales-cloud-simulator/webapp/index.html

Select Simulate incoming call. CAP publishes the sample event over WebSocket; the widget displays it and sends its XML notification to the parent simulator. Then use Answer and End inside the widget to exercise the reverse command flow.

## Example payload

    <payload>
        <Type>CALL</Type>
        <EventType>INBOUND</EventType>
        <Action>NOTIFY</Action>
        <ANI>+919876543210</ANI>
        <ExternalReferenceID>CALL-00002</ExternalReferenceID>
    </payload>

INCOMING is mapped to INBOUND. Later call states such as ANSWERED and ENDED are sent as their own EventType values.

The widget remains a separate application in an iframe. To connect a real Sales Cloud host later, replace this simulator page and configure the message origin and payload mapping for the tenant integration contract.
