define (
  [
    "backbone",
    "models/sandbox_output"
  ],
  function(Backbone, SandboxOutput) {
    "use strict";

    var Dashboard = Backbone.Collection.extend({
      model: SandboxOutput
    });

    return Dashboard;
  }
);
