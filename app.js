
var d3DemoApp = angular.module('d3DemoApp', ['ngMaterial', 'ui.router', 'ngNotify'])
  .config([
    '$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
      $urlRouterProvider.otherwise('/Home');
      $stateProvider
        .state('home', {
          url: '/Home',
          templateUrl: './views/home.html',
          controller: 'mainCtrl'
        }).state('discover', {
          url: '/Discover',
          templateUrl: './views/discover.html'
        }).state('service', {
          url: '/Service',
          templateUrl: './views/service.html',
          controller: 'ServiceCtrl'
        }).state('install', {
          url: '/Install',
          templateUrl: './views/install.html'
        });
    }
]).controller('mainCtrl', function($scope, $state, $mdDialog,$log, ngNotify,deviceService) {
    $scope.go = function(state) {
      $state.go(state);
    };
    $scope.showFile = function() {
      $scope.data = 'data';
      $mdDialog.show({
          controller: DialogController,
          templateUrl: './views/show_file.html',
          targetEvent: 'data',
        })
        .then(function(obj) {
          $log.info(obj);
          var promise=deviceService.uploadFile(obj);
          promise.then(function(data){
             $log.info(data);
          });
          promise.catch(function(data){

          });

        }, function() {
          //return $scope.notify("Invalid credentials!","error");
        });
    };

    $scope.notify = function(message, type) {
      ngNotify.set(message, {
        theme: 'pastel',
        position: 'bottom',
        duration: 3000,
        type: type,
        sticky: false
      });
    };

    function DialogController($scope, $mdDialog) {
        $scope.program="";
      $scope.file_changed = function(element) {
        $scope.$apply(function(scope) {
          $scope.program = element.files[0];
          var reader = new FileReader();
          reader.onload = function(e) {

          };
        });
      };
      $scope.hide = function() {
        $mdDialog.hide();
      };
      $scope.cancel = function() {
        $mdDialog.cancel();
      };
      $scope.answer = function(service, password) {
        if (!$scope.program) {
          $mdDialog.cancel();
        }
        $mdDialog.hide({files: $scope.program});
      };
    }

  });

// controller business logic
d3DemoApp.controller('AppCtrl', ['$scope', '$mdSidenav', '$state', '$log', '$mdDialog', 'deviceService', 'ngNotify', function($scope, $mdSidenav, $state, $log, $mdDialog, deviceService, ngNotify) {


  $scope.chartData = "";



  $scope.updateData = function() {
    var promise = deviceService.getDevices();
    promise.then(function(data) {
      $scope.chartData = data;
    });
    promise.catch(function(data) {
      $log.warn(data);
      $scope.chartData = {
        "name": "Server",
        "type": "Server",
        "icon": "server.png",
        "children": []
      };
    });
  };
  $scope.updateData();
  $scope.discover = function() {
    var promise = deviceService.discoverDevices();
    promise.then(function(data) {
      $scope.notify(data.info, data.status ? "success" : "error");
      $scope.updateData();
    });
    promise.catch(function(data) {
      $log.warn(data);
      $scope.chartData = {
        "name": "Server",
        "type": "Server",
        "icon": "server.png",
        "children": []
      };
    });
  };

  if ($state.current.url == "/Discover") {
    $scope.discover();
  }

  $scope.getInfo = function(data) {

    if ($state.current.url == "/Service") {

      $scope.data = data;
      $mdDialog.show({
          controller: DialogController,
          templateUrl: './views/show_service.html',
          targetEvent: data,
        })
        .then(function(obj) {
          $log.info(obj);
          if (!obj.service || !obj.password) {
            return $scope.notify("Invalid credentials!", "error");
          }
          var promise = deviceService.getInfo({
            username: obj.service,
            ip: $scope.data.ip,
            password: obj.password
          });
          promise.then(function(data) {
            if (data && data.hasOwnProperty('status')) {
              if (data.status) {
                //$scope.notify(data.info.ram,'success');
                $mdDialog.show(
                  $mdDialog.alert()
                  .parent(angular.element(document.body))
                  .title('Health of ' + $scope.data.name)
                  .content("Total RAM :  " + data.info.ram + "   Used RAM :  " + data.info.used)
                  .ariaLabel('Machine Details')
                  .ok('Got it!')
                  .targetEvent(data.info)
                );
              } else {
                $scope.notify(data.info, 'error');
                //$scope.updateData();
              }
            } else {
              $log.info(data);
            }
          });
          promise.catch(function(data) {
            $scope.notify(data.info, 'error');
          });
        }, function() {
          return $scope.notify("Invalid credentials!", "error");
        });

    };

    if ($state.current.url == "/Install") {
      $scope.data = data;
      $mdDialog.show({
          controller: DialogController,
          templateUrl: './views/install_service.html',
          targetEvent: data,
        })
        .then(function(obj) {
          $log.info(obj);
          var promise = deviceService.installService({
            username: $scope.data.username,
            ip: $scope.data.ip,
            service: obj.service,
            password: obj.password
          });
          promise.then(function(data) {
            if (data && data.hasOwnProperty('status')) {
              if (data.status) {
                $scope.notify(data.info, 'success');
                $scope.updateData();
              } else {
                $scope.notify(data.info, 'error');

              }
            } else {
              $log.info(data);
            }
          });
          promise.catch(function(data) {
            $scope.notify(data.info, 'error');
          });
        }, function() {

        });

    };

    function DialogController($scope, $mdDialog) {
      $scope.hide = function() {
        $mdDialog.hide();
      };
      $scope.cancel = function() {
        $mdDialog.cancel();
      };
      $scope.answer = function(service, password) {
        if (!service) {
          $mdDialog.cancel();
        }
        $mdDialog.hide({
          service: service,
          password: password
        });
      };
    }

  };

  $scope.notify = function(message, type) {
    ngNotify.set(message, {
      theme: 'pastel',
      position: 'bottom',
      duration: 3000,
      type: type,
      sticky: false
    });
  };

}]);


d3DemoApp.controller('ServiceCtrl', ['$scope', '$mdSidenav', '$log', 'deviceService', function($scope, $mdSidenav, $log, deviceService) {

  $scope.chartData = "";
  var promise = deviceService.getDevices();
  promise.then(function(data) {
    $scope.chartData = data;
  });
  promise.catch(function(data) {
    $log.warn(data);
    $scope.chartData = {
      "name": "Server",
      "type": "Server",
      "icon": "server.png",
      "children": []
    };
  })
  $scope.getInfo = function(data) {
    $log.info(data);
  };
}]);




d3DemoApp.directive('forceCollapisble', function($document, $window) {

  function fCollapsible(scope, element, attrs) {
    var w = angular.element($window);

    // Created a function that can watch the
    // width of the window so we know when
    // divs will trigger resizing
    scope.getWindowWidth = function() {
      return w[0].innerWidth;
    }
    scope.getWindowHeight = function() {
      return w[0].innerHeight;
    }
    scope.$watch(scope.getWindowWidth, function(newWidth, oldWidth) {
      if (newWidth != oldWidth) {
        scope.render();
      }
    });
    scope.$watch(scope.getWindowHeight, function(newHeight, oldHeight) {
      if (newHeight != oldHeight) {
        scope.render();
      }
    });

    // Capture the window event so we can capture
    // the media query boundaries
    w.bind('resize', function() {
      scope.$apply();
    });
    scope.$watch('chartData', function(newVal, oldVal) {
      console.log(newVal);
      //if(newVal!=oldVal){
      scope.render();
      //}
    })
    scope.render = function() {
      this.parentId = element[0];
      var params = this.param;
      $(this.parentId).html("");
      var width = $(element).parent().width(); // set width to container width
      var height = $(element).parent().height(); // set height to container height

      var bubble = {
        radius: 20,
        stroke: 'aqua',
        colors: 'white',
        width: 25,
        height: 25
      };

      var bubbleLink = {
        distance: 80,
        strength: 1,
        charge: -300,
        gravity: 0.05
      };


      // var radius =40 / 2 ,
      //     root;
      var root,
        n = 60;




      d3.behavior.zoom();
      var zoom = d3.behavior.zoom()
        .scaleExtent([1, 10])
        .on("zoom", zoomed);


      var drag = d3.behavior.drag()
        .origin(function(d) {
          return d;
        })
        .on("dragstart", dragstarted)
        .on("drag", dragged)
        .on("dragend", dragended);


      var force = d3.layout.force()
        .size([width, height]);
      //.on("tick", tick);


      var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([0, 0])
        .html(function(d) {
          return d.type + ": <span style='color:orangered'>" + d.name + "</span>";
        });
      // .style("stroke-width", 4);

      var svg = d3.select(this.parentId).append("svg")
        .attr('class', 'svg-body')
        .attr("width", width)
        .attr("height", height)
        .style("pointer-events", "all")
        //.on("mouseover", mouseover)
        //.on("mouseout", mouseout)
        .append("g");


      var rect = svg.append("rect")
        .attr("width", width)
        //.attr("id", "panzoom")
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .call(zoom).on('mousedown.drag', null).on("dblclick.zoom", null);

      var container = svg.append("g")
        .attr("class", "undraggable")
        .style("pointer-events", "all");


      var button1 = document.createElement('a');
      button1.setAttribute("href", "javascript:void(0);");
      button1.setAttribute("class", "zoomPanDefault");
          	*/
      var parentDiv = document.createElement('div');
      parentDiv.setAttribute("class", "overLay");
      //parentDiv.setAttribute("id", "panzoom");
      parentDiv.appendChild(button1);

      button1.style = {
          "position": "absolute",
          "left": "0",
          "botton": "0",
          "z-index": "1000"
        }


      button1.onclick = function() {
        //d3.select(".forceGraph").attr("transform", "translate(0,0)scale(1)");
        container.attr("transform", "translate(0,0)scale(1)");
        zoom.translate([0, 0]);
        zoom.scale([1]);
      };


      $(this.parentId).append(parentDiv);

      //Toggle stores whether the highlighting is on
      var toggle = 0;

      function connectedNodes(d) {
        console.log(d);
      }

      function defaultPanZoom() {
        //d3.select(".forceGraph").attr("transform", "translate(0,0)scale(1)");
        container.attr("transform", "translate(0,0)scale(1)");
        zoom.translate([0, 0]);
        zoom.scale([1]);
      }

      svg.call(tip);

      var link = container.selectAll(".link"),
        node = container.selectAll(".node");




      // d3.json("json/test.json", function(error, flare) {
      var json = JSON.parse(JSON.stringify(scope.chartData));
      root = json; //transform(params, json);
      // root = flare;
      update();
      // });
      var theView = this;

      function update() {
        var nodes = flatten(root),
          links = d3.layout.tree().links(nodes);

        // Restart the force layout.
        force.nodes(nodes)
          .links(links)
          .linkDistance(bubbleLink.distance)
          .charge(bubbleLink.charge)
          .linkStrength(bubbleLink.strength)
          .gravity(bubbleLink.gravity)
          .friction(0.7)
          .on('start', start)
          .start();



        // Update the links
        link = link.data(links) //, function(d) { return d.target.id; });

        // Exit any old links.
        link.exit().remove();

        // Enter any new links.
        link.enter().insert("line", ".node")
          .attr("class", "link")
          .attr("x1", function(d) {
            return d.source.x;
          })
          .attr("y1", function(d) {
            return d.source.y;
          })
          .attr("x2", function(d) {
            return d.target.x;
          })
          .attr("y2", function(d) {
            return d.target.y;
          });

        // Update the nodes
        node = node.data(nodes)

        // Exit any old nodes.
        node.exit().remove();

        // Enter any new nodes.
        node.enter().append("g")
          .attr("class", "node")
          .on("dblclick", click)
          .on("click", function(d) {
            mouseclick(d);
            connectedNodes(d);
          })
          .on('mouseover', tip.show)
          .on('mouseout',
            tip.hide)
          .call(force.drag);

        node.append("circle")
          .attr("r", bubble.radius)
          .attr('class', 'circle')
          .style("fill", bubble.colors)
          //.style("stroke-width", 2);
          .style("stroke-width", bubble.stroke)
          .style("stroke", function(d) {
            console.log(d.state);
            if (d.state == "LIVE") {
              return "#008000";
            } else if (d.state == "DYING") {
              return "#A52A2A";
            } else if (d.state == "INIT") {
              return "#90EE90";
            } else if (d.state == "ON") {
              return "#008000";

            } else if (d.state == "PUBLISHED") {
              return "#A52A2A";

            } else {
              //return "#3182bd";
              return "grey";
            }
          });

        node.append('image')
          .attr("xlink:href", function(d) {
            return d.icon
              // return "./img/vcl/usercomponents"+d.icon
          })
          .attr('class', 'img')
          .attr("width", bubble.width)
          .attr("height", bubble.height)
          .attr('x', -12)
          .attr('y', -12)

        svg.style("opacity", 0.2)
          .transition()
          .duration(500)
          .style("opacity", 1);
      }

      function start() {
        var ticksPerRender = 6;

        requestAnimationFrame(function render() {

          for (var i = 0; i < ticksPerRender; i++) {
            force.tick();
          }

          link.attr("x1", function(d) {
              return d.source.x;
            })
            .attr("y1", function(d) {
              return d.source.y;
            })
            .attr("x2", function(d) {
              return d.target.x;
            })
            .attr("y2", function(d) {
              return d.target.y;
            });


          node.attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
          });


          if (force.alpha() > 0.005) {
            requestAnimationFrame(render);
          }
        });
      }



      function tick() {

        //console.log(e.alpha);
        link.attr("x1", function(d) {
            return d.source.x;
          })
          .attr("y1", function(d) {
            return d.source.y;
          })
          .attr("x2", function(d) {
            return d.target.x;
          })
          .attr("y2", function(d) {
            return d.target.y;
          });


        node.attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ")";
        });

      }

      // Toggle children on click.
      function click(d) {
        if (!d3.event.defaultPrevented) {
          if (d.children) {
            d._children = d.children;
            d.children = null;
          } else {
            d.children = d._children;
            d._children = null;
          }
          update();
        }
      }

      function mouseclick(d) {
        console.log(d);
        mydata = d;
        scope.getInfo(d);


      }



      // Returns a list of all nodes under the root.
      function flatten(root) {
        var nodes = [],
          i = 0;

        function recurse(node) {
          if (typeof(node) != "undefined") {
            if (node.children) node.children.forEach(recurse);
            if (!node.id) node.id = ++i;
            nodes.push(node);
          }
        }

        recurse(root);
        return nodes;
      }

      function zoomed() {
        container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
      }

      function dragstarted(d) {
        d3.event.sourceEvent.stopPropagation();
        d3.select(this).classed("dragging", true);
      }

      function dragged(d) {
        d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
      }

      function dragended(d) {
        d3.select(this).classed("dragging", false);
      }


      $(".svg-body").bind("click", function(event) {
        if (event.target.classList.toString() == 'img' || event.target.classList.toString() == 'circle' || event.target.classList.toString() == 'node' || event.target.classList.toString() == 'link') return;
        console.log('hi');
        toggle = 1;
        if (toggle == "1") {
          //Put them back to opacity=1
          node[0].filter(function(obj) {
            obj.children[0].style.setProperty("stroke-width", "3", "important");
            //return obj.__data__===d;
          });
          node.style("opacity", 1);
          toggle = 0;

        }
      }.bind(this));
    };
    //  });

  }
  return {
    restrict: 'E',
    scope: {
      val: "=charData"
    },
    controller: 'AppCtrl',
    transclude: true,
    link: fCollapsible,
    template: ''
  }
});
