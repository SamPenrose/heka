define(
  [
    "views/base_view",
    "hgn!templates/dashboard/dashboard_index"
  ],
  function(BaseView, DashboardIndexTemplate) {
    "use strict";
    /**
    * Index view for Dashboards. This is a top level view that's loaded by the router.
    *
    * @class DashboardIndex
    * @extends BaseView
    *
    * @constructor
    */
    var DashboardIndex = BaseView.extend({
      template: DashboardIndexTemplate,

      getBootstrapRowDiv: function() {
        var div = document.createElement("div");
        div.setAttribute("class", "row");
        return div;
      },

      getBootstrapColDiv: function() {
        var div = document.createElement("div");
        div.setAttribute("class", "col-md-6");
        return div;
      },

      renderGraphs: function() {
        var main = document.getElementById("dashboards-main");
        this.i = 0;
        var loadGraph = function(outputView) {
          window.ov = outputView;
          if ((this.i % 2) == 0) { // start a new row
            main.appendChild(this.getBootstrapRowDiv());
          }
          this.i += 1;
          var div = this.getBootstrapColDiv();
          var graph = outputView.render().el; // ???
          div.appendChild(graph);
          main.appendChild(div);
        }.bind(this);
        this.model.get("graphs").forEach(function(graph) {
          // XXX clean up
          var parts = graph.split("/");
          this.graphLoader(parts[1], parts[3], loadGraph);
        }.bind(this));
      },

      afterRender: function() {
        setTimeout(this.renderGraphs.bind(this), 10);
      }
    });
    return DashboardIndex;
  }
);
