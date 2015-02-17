define(
  [
    "jquery",
    "backbone",
    "adapters/plugins_adapter",
    "adapters/sandboxes_adapter",
    "adapters/dashboards_adapter",
    "views/health/health_index",
    "views/sandboxes/sandboxes_index",
    "views/sandboxes/sandbox_output_cbuf_show",
    "views/sandboxes/sandbox_output_txt_show",
    "views/health/plugins_show",
    "views/termination_report/termination_report_index",
    "views/dashboard/dashboard_index"
  ],
  function($, Backbone, PluginsAdapter, SandboxesAdapter, DashboardsAdapter, HealthIndex, SandboxesIndex, SandboxOutputCbufShow, SandboxOutputTxtShow, PluginsShow, TerminationReportIndex, DashboardIndex) {
    "use strict";

    /**
    * Router for the dashboard.
    *
    * Provides the following routes:
    *
    * - `/#`
    * - `/#health`
    *
    * - `/#plugins/inputs/:name`
    * - `/#plugins/decoders/:name`
    * - `/#plugins/filters/:name`
    * - `/#plugins/outputs/:name`
    * - `/#plugins/encoders/:name`
    *
    * - `/#sandboxes`
    * - `/#sandboxes/:sandboxName/outputs/:shortFileName`
    * - `/#sandboxes/:sandboxName/outputs/:shortFileName/embed`
    * - `/#sandboxes/:sandboxName/outputs/:shortFileName/graph-order/:ordinal`
    * - `/#sandboxes-new-dashboard`
    * - `/#sandboxes-update-dashboard`
    *
    * - `/#dashboard/:dashboardName`
    *
    * - `/#termination_report`
    *
    * @class Router
    *
    * @constructor
    */
    var Router = Backbone.Router.extend({
      routes: {
        "": "showHealthIndex",
        "health": "showHealthIndex",

        "plugins/inputs/:name": "showInput",
        "plugins/decoders/:name": "showDecoder",
        "plugins/filters/:name": "showFilter",
        "plugins/outputs/:name": "showOutput",
        "plugins/encoders/:name": "showEncoder",

        "sandboxes": "showSandboxesIndex",
        "sandboxes/:sandboxName/outputs/:shortFileName": "showSandboxOutput",
        "sandboxes/:sandboxName/outputs/:shortFileName/embed": "showSandboxOutput",
        "sandboxes/:sandboxName/outputs/:shortFileName/graph-order/:ordinal": "setGraphOrder",
        "sandboxes-new-dashboard": "showDashboardBuilder",
        "sandboxes-update-dashboard/:dashboardName": "showDashboardBuilder",
        "sandboxes-set-dashboard-name": "setDashboardName",

        "dashboard/:dashboardName": "showDashboard",

        "termination_report": "showTerminationReportIndex"
      },

      /**
      * Loads and navigates to the health index.
      *
      * @method showHealthIndex
      */
      showHealthIndex: function() {
        this._switch(new HealthIndex());
      },

      /**
      * Loads input plugin by name and navigates to plugin's show.
      *
      * @method showInput
      */
      showInput: function(name) {
        PluginsAdapter.instance().findInputWhere({ Name: name }, function(input) {
          this._switch(new PluginsShow({ model: input }));
        }.bind(this));
      },

      /**
      * Loads decoder plugin by name and navigates to plugin's show.
      *
      * @method showDecoder
      */
      showDecoder: function(name) {
        PluginsAdapter.instance().findDecoderWhere({ Name: name }, function(decoder) {
          this._switch(new PluginsShow({ model: decoder }));
        }.bind(this));
      },

      /**
      * Loads filter plugin by name and navigates to plugin's show.
      *
      * @method showInput
      */
      showFilter: function(name) {
        PluginsAdapter.instance().findFilterWhere({ Name: name }, function(filter) {
          this._switch(new PluginsShow({ model: filter }));
        }.bind(this));
      },

      /**
      * Loads output plugin by name and navigates to plugin's show.
      *
      * @method showInput
      */
      showOutput: function(name) {
        PluginsAdapter.instance().findOutputWhere({ Name: name }, function(output) {
          this._switch(new PluginsShow({ model: output }));
        }.bind(this));
      },

      /**
      * Loads encoder plugin by name and navigates to plugin's show.
      *
      * @method showEncoder
      */
      showEncoder: function(name) {
        PluginsAdapter.instance().findEncoderWhere({ Name: name }, function(encoder) {
          this._switch(new PluginsShow({ model: encoder }));
        }.bind(this));
      },

      /**
      * Loads and navigates to the sandboxes index.
      *
      * @method showSandboxesIndex
      */
      showSandboxesIndex: function() {
        var index = new SandboxesIndex()
        // XXX require() workaround
        index.dashboardsAdapter = DashboardsAdapter.instance();
        this._switch(index);
      },

      /**
      * Loads the correct sandbox output show view based on the Filename extension.
      */
      _putSandBoxOutputInView: function(sandboxName, shortFilename, viewLoader) {
        SandboxesAdapter.instance().findSandboxWhere({ Name: sandboxName }, function (sandbox) {
          var sandboxOutput = sandbox.findOutputByShortFilename(shortFilename);
          var outputView;
          if (sandboxOutput) {
            if (shortFilename.match(/\.cbuf$/)) {
              outputView = new SandboxOutputCbufShow({ model: sandboxOutput, sandbox: sandbox });
            } else {
              outputView = new SandboxOutputTxtShow({ model: sandboxOutput, sandbox: sandbox });
            }
            viewLoader(outputView);
          }
        });
      },

      showSandboxOutput: function(sandboxName, shortFilename) {
        this._putSandBoxOutputInView(sandboxName, shortFilename, function(outputView) {
          this._switch(outputView);
        }.bind(this));
      },

       /**
      * Flip whether the graph for this output is shown.
      *
      * @method setGraphOrder
      */
      setGraphOrder: function(sandboxName, shortFilename, ordinal) {
        var loadGraphInOrdinal = function(outputView) {
          var gridSelector = "#sandbox-graph-holder-" + ordinal.toString();
          $(gridSelector).empty();
          $(gridSelector).append(outputView.render().el);
          this.currentView.updateDashboard(outputView.model);
        }.bind(this);
        this._putSandBoxOutputInView(sandboxName, shortFilename, loadGraphInOrdinal);
      },

      showDashboardBuilder: function(dashboardName) {
        this.currentView.showDashboardBuilder(dashboardName);
      },

      setDashboardName: function() {
        this.currentView.setDashboardName();
      },

      showDashboard: function(dashboardName) {
        var adapter = DashboardsAdapter.instance();
        var model = adapter.findWhereNamed(dashboardName);
        var view = new DashboardIndex({model: model});
        view.graphLoader = this._putSandBoxOutputInView.bind(this);
        this._switch(view);
      },

      /**
      * Loads and navigates to the termination report index.
      *
      * @method showTerminationReportIndex
      */
      showTerminationReportIndex: function() {
        this._switch(new TerminationReportIndex());
      },

      /**
      * Destroys the previous view and switches to the new one.
      *
      * @method _switch
      * @private
      */
      _switch: function(view) {
        // Destroy previous view
        if (this.currentView) {
          this.currentView.destroy();
        }

        // Assign new view
        this.currentView = view;

        // Add embed class if the url contains embed
        if (window.location.href.match(/\/embed$/)) {
          $("html").addClass("embed");
        } else {
          $("html").removeClass("embed");
        }

        // Make sure we're scrolled to the top
        window.scrollTo(0, 1);

        // Render and insert the element
        $("#content").html(this.currentView.render().el);


        // Close navbars
        if ($(window).width() <= 768 && $(".navbar-collapse").is(":visible")) {
          $(".navbar-collapse").collapse("hide");
        }
      }
    });

    return Router;
  }
);
