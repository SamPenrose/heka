define(
  [
    "backbone",
    "underscore"
  ],
  function(Backbone) {
    "use strict";

    // XXX when we need to talk to server, consider extending BaseAdapter
    var DashboardsAdapter = function() {
      this.dashboards = new Backbone.Collection({model: Backbone.Model});
      if (this.dashboards.models) { // XXX why?
        this.dashboards.remove(this.dashboards.models[0]);
      }
      var dashboard1 = this.create({
        Name: 'preload1',
        id: 'preload1',
        graphs: ["#sandboxes/http_status/outputs/http_status.HTTPStatus.cbuf"],
        outputs: [] // XXX derive from outputs?
      });
      var dashboard2 = this.create({
        Name: 'preload2',
        id: 'preload2',
        graphs: ["#sandboxes/http_status/outputs/http_status.HTTPStatus.cbuf",
                 "#sandboxes/http_status/outputs/http_status.HTTPStatus.cbuf"],
        outputs: []
      });
      this.dashboards.add(dashboard1);
      this.dashboards.add(dashboard2);
      window.dai = this;
    };

    DashboardsAdapter.instance = function() {
      if (!this._instance) {
        this._instance = new DashboardsAdapter();
      }
      return this._instance;
    };

    _.extend(DashboardsAdapter.prototype, {

      temporaryName: 'New Dashboard',

      create: function(options) {
        if (!options) {
          options = {
          "Name": this.temporaryName,
          "id": this.temporaryName,
          "graphs": [],
          "outputs": []
          }
        }
        var dashboard = new Backbone.Model(options);
        this.dashboards.add(dashboard);
        return dashboard;
      },

      findWhereNamed: function(name) {
        return this.dashboards.findWhere({Name: name});
      },

      save: function(dashboard) {
        if (!dashboard.get("id")) {
          dashboard.set("id", dashboard.get("Name"));
        }
        this.dashboards.add(dashboard);
      },

      /**
       * Decompose graph URIs into triples that uniquely identify the graph,
       * so heka can persist them to disk.
       */
      freeze: function(dashboard) {
        var result = {Name: dashboard.get("Name"),
                      outputs: []};
        dashboard.outputs.each(function(output) {
          result.outputs.push({
             Name: output.get("Name"),
             Filename: output.get("Filename"),
             SandboxName: output.get("SandboxName")
          });
        });
        return result;
      }
    });

    return DashboardsAdapter;
  }
);
