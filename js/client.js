/* global TrelloPowerUp */

let GRAY_ICON =
  "https://raw.githubusercontent.com/michael-roedel/smart-deadlines/master/images/timelapse.svg";
let COUNTER_GRAY_ICON =
  "https://raw.githubusercontent.com/michael-roedel/smart-deadlines/master/images/counter.svg";

let setCardEstimation = function(t, value) {
  t.set("card", "shared", "estimation", value);
  return t.closePopup();
};

let estimationSelectionString = function(estimation, value) {
  return estimation ? (estimation.estimation === value ? " ✓" : "") : "";
};

let getBadges = async function(t, isEditMode) {
  let list = await t.list("name", "id");
  let isActive = await t.get("board", "private", list.id + "isActive");
  if (!isActive) {
    return [];
  }
  return t
    .card("id")
    .get("id")
    .then(async function(id) {
      if (!id) {
        return [];
      }
      let estimation = await t.get(id, "shared", "estimation");
      let badges = [];
      if (isEditMode || estimation) {
        let estimationBadge = {
          title: "Estimation",
          text: estimation ? estimation.text : "No estimation",
          icon: GRAY_ICON,
        };
        badges.push(estimationBadge);
      }

      let appointmentsData = await t.get(id, "shared", "appointments");
      let appointments = appointmentsData ? appointmentsData.appointments : undefined;
      if (appointments) {
        let appointmentsBadge = {
          title: "Appointment(s)",
          text: appointments.length + " Appointment(s)",
          icon: COUNTER_GRAY_ICON,
        };
        badges.push(appointmentsBadge);
      }

      return badges;
    });
};

TrelloPowerUp.initialize(
  {
    "card-badges": function(t) {
      return getBadges(t);
    },
    "card-back-section": async function(t, options) {
      
      let list = await t.list("name", "id");
      let isActive = await t.get("board", "private", list.id + "isActive");
      if (!isActive) {
        return;
      }
      
      return {
        title: "Estimation",
        icon: GRAY_ICON, // Must be a gray icon, colored icons not allowed.
        content: {
          type: "iframe",
          url: t.signUrl(window.TrelloPowerUp.util.relativeUrl("./estimation-edit.html")),
          height: 115
        }
      };
    },
    "board-buttons": function (t, opts) {
      return [{
        // or we can also have a button that is just a simple url
        // clicking it will open a new tab at the provided url
        icon: {
          dark: GRAY_ICON,
          light: GRAY_ICON
        },
        text: 'Smart Deadlines',
        condition: 'always',
        callback: function(t1) {
                return t.modal({
                  url: "../components/appointments.html",
                  accentColor: "#CDD3D8",
                  height: 600,
                  fullscreen: false,
                  title: "Card appointments",
                  actions: []
                });
              }
      }];
    },
    "list-actions": function(t) {
      return t.list("name", "id").then(async function(list) {
        let isActive = await t.get("board", "private", list.id + "isActive");
        if (isActive) {
          return [
            {
              text: "Calculate smart deadlines...",
              callback: function(t1) {
                return t.modal({
                  url: "../components/calculation.html",
                  accentColor: "#CDD3D8",
                  args: { listId: list.id, listName: list.name },
                  height: 412,
                  fullscreen: false,
                  title: "Calculation of smart deadlines",
                  actions: []
                });
              }
            },
            {
              text: "Settings for list...",
              callback: function(t2) {
                return t2.popup({
                  title: "Settings for list",
                  url: "../components/settings.html",
                  args: { listId: list.id, listName: list.name },
                  height: 362
                });
              }
            }
          ];
        } else {
          return [
            {
              text: "Activate for list",
              callback: async function(t1) {
                await t1.set("board", "private", list.id + "isActive", true);
                return t1.closePopup();
              }
            }
          ];
        }
      });
    },

    "on-enable": function(t) {
      let trelloAPIKey = "5db50da477d5b9033e479892f742bf8d";
      return t.modal({
        url: "../components/authorize.html",
        args: {
          apiKey: trelloAPIKey,
          isModal: true
        },
        accentColor: "#CDD3D8",
        height: 140,
        fullscreen: false,
        title: "Setup - Step 1",
        actions: []
      });
    },
    "show-settings": function(t) {
      return t.popup({
        title: "Global Settings",
        url: "../components/settings-global.html",
        height: 467
      });
    },
    "authorization-status": function(t) {
      return t.get("board", "private", "token").then(function(token) {
        if (token) {
          return { authorized: true };
        }
        return { authorized: false };
      });
    },
    "show-authorization": function(t) {
      let trelloAPIKey = "5db50da477d5b9033e479892f742bf8d";
      return t.popup({
        title: "Authorization",
        args: {
          apiKey: trelloAPIKey
        },
        url: "../components/authorize.html",
        height: 130
      });
    }
  },
  {
    appKey: "5db50da477d5b9033e479892f742bf8d",
    appName: "Smart Deadlines"
  }
);
