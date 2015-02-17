define(
  [
    "views/base_view",
    "hgn!templates/sandboxes/sandboxes_index",
    "adapters/sandboxes_adapter",
    "presenters/plugin_presenter"
  ],
  function(BaseView, SandboxesIndexTemplate, SandboxesAdapter, PluginPresenter) {
    "use strict";

    /**
    * Index view for sandboxes. This is a top level view that's loaded by the router.
    *
    * @class SandboxesIndex
    * @extends BaseView
    *
    * @constructor
    */
    var SandboxesIndex = BaseView.extend({
      presenter: PluginPresenter,
      template: SandboxesIndexTemplate,

      initialize: function() {
        this.adapter = SandboxesAdapter.instance();
        this.collection = this.adapter.sandboxes;

        this.listenTo(this.collection, "add remove reset change", this.render, this);
        this.dashboardToEdit = null;
        this.adapter.fill();
      },

      showDashboardBuilder: function(dashboardName) {
        var dashboard, checkboxSelector;

        $("#sandboxes-dashboard-preview-table").css("visibility", "visible");
        $(".sandboxes-output-graph").css("visibility", "visible")
        if (dashboardName) {
          $("#dashboard-name-input").val(dashboardName);
          // or jquery set incomingId attribute on same element
          this.dashboardToEdit = dashboardName;
        } else {
          dashboardName == this.dashboardsAdapter.temporaryName;
        }

        if (dashboardName == this.dashboardsAdapter.temporaryName) {
          this.dashboardsAdapter.create();
        } else {
          // Set checkboxes and graph fields; maybe latter via event on former?
          dashboard = this.dashboardsAdapter.findWhereNamed(dashboardName);
          dashboard.get('graphs').forEach(function(graphURI) {
            checkboxSelector = "[id='" + graphURI + "/graph-order/1']";
            // The checkbox URL-as-id approach violates HTML's rules for ids.
            // XXX fix this, which will require encoding or whatever.
            $(checkboxSelector).trigger("click");
          });
        }
      },

      getCurrentDashboard: function() {
        if (this.dashboardsAdapter.dashboards.length) {
          return this.dashboardsAdapter.dashboards.last();
        }
        return this.dashboardsAdapter.create();
      },

      updateDashboard: function(output) {
        var graphName = window.location.hash; // XXX
        // XXX where do we store which dashboard selected?
        var dashboard = this.dashboardsAdapter.dashboards.get(this.dashboardToEdit);
        dashboard.get('graphs').push(graphName);
        dashboard.get('outputs').push(output);
      },

      setDashboardName: function() {
        var name = $("#dashboard-name-input").val();
        var dashboard = this.dashboardsAdapter.dashboards.get(this.dashboardToEdit);
        dashboard.set("Name", name);
        dashboard.set("id", name);
        window.location = ("#dashboard/"+ name);
      },

      afterRender: function() {
        var dashboardMenu = $("#existingDashboards");
        var menuItem = '<option class="selectedDashboard">%Name1</option>';
        var target;

        setTimeout(function() {
          // jQuery sometimes simply fails to update the DOM.
          // http://stackoverflow.com/questions/4800372/why-would-append-randomly-fail-in-jquery
          function populate(dashboard) {
            var menuFromDOM = document.getElementById("existingDashboards");
            var option = document.createElement('option');
            option.setAttribute("class", "selectedDashboard");
            var itemText = document.createTextNode(dashboard.get("Name"));
            option.appendChild(itemText);
            menuFromDOM.appendChild(option);
          }
          this.dashboardsAdapter.dashboards.each(populate.bind(this));

          $("#dashboardMenu").attr("size", this.dashboardsAdapter.dashboards.length + 2);
          var self = this;
          $("select").change(function(event) {
            $("select option:selected").each(function() {
              self.showDashboardBuilder($(this).text());
            });
          });

          $(".sandboxes-graph-checkbox").on('click', function(event) {
            window.location = event.target.id;
          });

        }.bind(this), 10);
      }
    });

    return SandboxesIndex;
  }
);
