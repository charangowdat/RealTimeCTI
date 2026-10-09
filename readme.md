# Getting Started

Welcome to your new CAP project.

It contains these folders and files, following our recommended project layout:

File or Folder | Purpose
---------|----------
`app/` | content for UI frontends goes here
`db/` | your domain models and data go here
`srv/` | your service models and code go here
`readme.md` | this getting started guide

## Next Steps

- Open a new terminal and run `cds watch`
- (in VS Code simply choose _**Terminal** > Run Task > cds watch_)
- Start with your domain model, in a CDS file in `db/`

## Learn More

Learn more at <https://cap.cloud.sap>.

## Run with the Sales Cloud simulator

Start CAP with npm run dev, then start the phone simulator in a second terminal with node simulator/phone-simulator.js. Open:

    http://localhost:4004/sales-cloud-simulator/webapp/index.html

Select Simulate incoming call. The CTI widget receives the call over WebSocket and sends an XML notification to its parent iframe host with window.parent.postMessage(). Use Answer and End in the widget to exercise the reverse command flow and see updates in the simulator.

See app/sales-cloud-simulator/webapp/README.md for the payload and full steps.
