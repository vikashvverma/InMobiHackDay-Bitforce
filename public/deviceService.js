angular.module('d3DemoApp')
    .factory('deviceService',function($http,$log,$q){
        var device={};
        return {
            getDevices:function(){
                return $http({
                    method:'GET',
                    url:'device.json'
                }).then(function(data){
                    $log.info(data.data);
                    return data.data;
                },function(data){
                    $log.warn(data.data);
                    return data.data;
                });
            },
            discoverDevices:function(){
                return $http({
                    method:'GET',
                    url:'/discover'
                }).then(function(data){
                    $log.info(data.data);
                    return data.data;
                },function(data){
                    $log.warn(data.data);
                    return data.data;
                });
            },
            getInfo:function(model){
                return $http({
                    method:'POST',
                    url:'/monitoring',
                    data:model
                }).then(function(data){
                    $log.info(data.data);
                    return data.data;
                },function(data){
                    $log.warn(data.data);
                    return data.data;
                })
            },
            installService:function(model){
                return $http({
                    method:'POST',
                    url:'/install',
                    data:model
                }).then(function(data){
                    $log.info(data.data);
                    return data.data;
                },function(data){
                    $log.warn(data.data);
                    return data.data;
                });
            },
            uploadFile:function(model){
                return $http({
            method:'POST',
            url:'/upload',
            headers:{'Content-Type':undefined},
            transformRequest:function(data){
              var formData=new FormData();
                formData.append('file',data.files);
                $log.debug(formData);
                $log.debug(data);
                return formData;
            },
            data:{files:model.files}
        }).then(function(data){
            console.log(data.data);
            //user=data.data;
            return data.data;
        },function(data){
            //return data.data;
            //$q.reject({status:data.data.status,info:"User already registered!"});
            //console.log(data.data);
        });
            }
        };
    });
