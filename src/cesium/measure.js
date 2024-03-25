import * as Cesium from 'cesium'

//点位数组 + 海伦公式
const measureArea = (viewer) => {
    viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    var positions = []
    var poly = null
    var distance = 0
    var cartesian = null
    var labelPt
    let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    handler.setInputAction(
        function (ele) {

            let ray = viewer.camera.getPickRay(ele.position)
            cartesian = viewer.scene.globe.pick(ray, viewer.scene);
            if (!Cesium.defined(cartesian)) return
            if (positions.length === 0) {
                positions.push(cartesian.clone())
            }
            positions.push(cartesian)

            labelPt = positions[positions.length - 1]
            if (positions.length > 2) {
                getSpaceDistance(positions)
            } else if (positions.length == 2) {

                viewer.entities.add({
                    name: '_range',
                    id: "range",
                    position: labelPt,
                    point: {
                        pixelSize: 5,
                        color: Cesium.Color.RED,
                        outlineColor: Cesium.Color.WHITE,
                        outlineWidth: 2,
                    },
                    label: {
                        text: '起 点',
                        font: 'normal 18px SimHei',
                        fillColor: Cesium.Color.ORANGE, // 文本颜色
                        backgroundColor: Cesium.Color.WHITE, // 背景色
                        style: Cesium.LabelStyle.FILL, // 文本样式，轮廓
                        outlineWidth: 2, // 轮廓宽度
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // 圆点位置
                        horizontalOrigin: Cesium.HorizontalOrigin.LEFT, // 文本的位置
                        pixelOffset: new Cesium.Cartesian2(0, -10), // 文本偏移量，Cartesian2
                    }
                });
            }

        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    handler.setInputAction(function (ele) {
        let ray = viewer.camera.getPickRay(ele.endPosition)
        cartesian = viewer.scene.globe.pick(ray, viewer.scene)
        if (!Cesium.defined(cartesian)) {
            return
        }
        if (positions.length >= 2) {
            if (!Cesium.defined(poly)) {

                poly = new PolyLinePrimitive(positions)
            } else {
                positions.pop()
                positions.push(cartesian)
            }
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    var PolyLinePrimitive = (
        function () {
            function line(positions) {
                this.options = {
                    name: '_range',
                    polyline: {
                        show: true,
                        positions: [],
                        material: Cesium.Color.CORNFLOWERBLUE,
                        width: 3,
                        clampToGround: true
                    },
                }
                this.positions = positions;
                this.init()
            }
            line.prototype.init = function () {
                var update = () => {
                    return this.positions
                }
                this.options.polyline.positions = new Cesium.CallbackProperty(update, false)
                viewer.entities.add(this.options)
            }
            return line
        })()
    handler.setInputAction(function (ele) {

        let ray = viewer.camera.getPickRay(ele.position);
        cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        if (!Cesium.defined(cartesian))
            return;
        if (positions.length === 0) {
            positions.push(cartesian.clone());
        }
        positions.push(cartesian);

        labelPt = positions[positions.length - 1];
        if (positions.length > 2) {
            getSpaceDistance(positions);
        } else if (positions.length === 2) {

            viewer.entities.add({
                name: '_range',
                position: labelPt,
                point: {
                    pixelSize: 5,
                    color: Cesium.Color.RED,
                    outlineColor: Cesium.Color.MINTCREAM,
                    outlineWidth: 2,
                }
            });
        };
        let area = (calculateArea(positions) / 1000000.0).toFixed(3);
        console.log(area)
        viewer.entities.add({
            name: '_range',
            position: center(positions),
            label: {
                text: `${area}平方千米`,
                font: 'normal 25px SimHei',
                fillColor: Cesium.Color.ORANGE, // 文本颜色
                backgroundColor: Cesium.Color.WHITE, // 背景色
                style: Cesium.LabelStyle.FILL, // 文本样式，轮廓
                outlineWidth: 2, // 轮廓宽度
                pixelOffset: new Cesium.Cartesian2(0, -30), // 文本偏移量，Cartesian2
            }
        })
        positions.push(positions[0])
        handler.destroy(); // 删除事件
        handler = undefined;

    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

    //计算中心
    function center(positions) {
        // 初始化
        let x = 0;
        let y = 0;
        let z = 0;
        let num = positions.length;
        // 遍历每个顶点，计算其贡献的重心坐标和体积，并累加到总和中
        for (let i = 0; i < num; i++) {
            x += positions[i].x;
            y += positions[i].y;
            z += positions[i].z
        }
        // 计算多边形的中心坐标
        let centerX = x / num;
        let centerY = y / num;
        let centerZ = z / num;
        let center = new Cesium.Cartesian3(centerX, centerY, centerZ);
        // 返回中心坐标
        return center;
    }
    // 两点距离计算函数
    function getSpaceDistance(positions) {

        let i = positions.length - 3
        let pointCartographic1 = Cesium.Cartographic.fromCartesian(positions[i])
        let pointCartographic2 = Cesium.Cartographic.fromCartesian(positions[i + 1])
        getTerrainDistance(pointCartographic1, pointCartographic2)
    }
    function getTerrainDistance(poin1, poin2) {
        var geodesic = new Cesium.EllipsoidGeodesic();
        geodesic.setEndPoints(poin1, poin2);
        var s = geodesic.surfaceDistance;
        var cartoPts = [poin1];
        for (let i = 1000; i < s; i += 1000) {
            var cartoPt = geodesic.interpolateUsingSurfaceDistance(i);
            cartoPts.push(cartoPt);
        }
        cartoPts.push(poin2);
        var promise = Cesium.sampleTerrain(viewer.terrainProvider, 2, cartoPts);
        promise.then(function (updatedPositions) {

            let distance = 0;
            for (let i = 0; i < updatedPositions.length - 1; i++) {
                var geoD = new Cesium.EllipsoidGeodesic();
                geoD.setEndPoints(updatedPositions[i], updatedPositions[i + 1]);
                var innerS = geoD.surfaceDistance;
                innerS = Math.sqrt(
                    Math.pow(innerS, 2) +
                    Math.pow(
                        updatedPositions[i + 1].height - updatedPositions[i].height,
                        2
                    )
                );
                distance += innerS;
            }
            var textDisance =
                distance > 10000
                    ? (distance / 1000.0).toFixed(2) + "公里"
                    : (distance / 500.0).toFixed(2) + "里";
            viewer.entities.add({
                name: "_range",
                position: labelPt,
                point: {
                    poixeSize: 4,
                    color: Cesium.Color.RED,
                    outlineColor: Cesium.Color.MINTCREAM,
                    outlineWidth: 2,
                },
                label: {
                    text: textDisance,
                    font: "18px sans-serif",
                    fillColor: Cesium.Color.GOLD,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outLineWidth: 2,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(0, -10),
                },
            });
        });
    }
    function calculateArea(points) {

        if (!points || points.length < 3) {
            return 0;
        }
        let area = 0;
        for (let i = 0; i < points.length - 2; i++) {
            let p1 = points[i];
            let p2 = points[i + 1];
            let p3 = points[i + 2];
            let a = Cesium.Cartesian3.distance(p1, p2);
            let b = Cesium.Cartesian3.distance(p2, p3);
            let c = Cesium.Cartesian3.distance(p1, p3);
            let s = (a + b + c) / 2;
            let triangleArea = Math.sqrt(s * (s - a) * (s - b) * (s - c));
            area += triangleArea;
        }
        return area;
    }
}

const measureLine = (viewer) => {
    // 取消右击事件
    viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    var positions = [] // 记录位置
    var poly = null // 记录线
    var distance = 0 // 记录距离
    var cartesian = null // 获取鼠标与地图的交点
    var labelPt // 最终位置
    let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    // 鼠标左键点击事件
    handler.setInputAction(function (ele) {
        // 创建射线并获取交点
        let ray = viewer.camera.getPickRay(ele.position)
        cartesian = viewer.scene.globe.pick(ray, viewer.scene)
        if (!Cesium.defined(cartesian)) return
        if (positions.length === 0) {
            positions.push(cartesian.clone())
        }
        positions.push(cartesian)
        // 记录鼠标单击时的位置，异步计算贴地距离
        labelPt = positions[positions.length - 1]
        if (positions.length > 2) {
            getSpaceDistance(positions)
        } else if (positions.length == 2) {
            //在三维场景中添加圆点
            viewer.entities.add({
                name: '_range',
                id: "range1",
                position: labelPt,
                point: {
                    pixelSize: 5,
                    color: Cesium.Color.RED,
                    outlineColor: Cesium.Color.WHITE,
                    outlineWidth: 2,
                },
                label: {
                    text: '起 点',
                    font: 'normal 18px SimHei',
                    fillColor: Cesium.Color.ORANGE, // 文本颜色
                    backgroundColor: Cesium.Color.WHITE, // 背景色
                    style: Cesium.LabelStyle.FILL, // 文本样式，轮廓
                    outlineWidth: 2, // 轮廓宽度
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // 圆点位置
                    horizontalOrigin: Cesium.HorizontalOrigin.LEFT, // 文本的位置
                    pixelOffset: new Cesium.Cartesian2(0, -10), // 文本偏移量，Cartesian2
                }
            });
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    // 鼠标移动事件
    handler.setInputAction(function (ele) {
        let ray = viewer.camera.getPickRay(ele.endPosition)
        cartesian = viewer.scene.globe.pick(ray, viewer.scene)
        // 判断是否定义该对象
        if (!Cesium.defined(cartesian)) {
            return
        }
        if (positions.length >= 2) {
            if (!Cesium.defined(poly)) {
                // 移动时路径绘制
                poly = new PolyLinePrimitive(positions)
            } else {
                positions.pop()
                positions.push(cartesian)
            }
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    //鼠标右键事件
    handler.setInputAction(function (ele) {
        // 创建射线并获取交点
        let ray = viewer.camera.getPickRay(ele.position);
        cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        if (!Cesium.defined(cartesian))
            return;
        if (positions.length === 0) {
            positions.push(cartesian.clone());
        }
        positions.push(cartesian);
        // 记录鼠标单击时的节点位置，异步计算贴地距离
        labelPt = positions[positions.length - 1];
        if (positions.length > 2) {
            getSpaceDistance(positions);
        } else if (positions.length === 2) {
            // 在三维场景中添加Label
            viewer.entities.add({
                name: '_range',
                position: labelPt,
                point: {
                    pixelSize: 5,
                    color: Cesium.Color.RED,
                    outlineColor: Cesium.Color.MINTCREAM,
                    outlineWidth: 2,
                }
            });
        }
        handler.destroy(); // 删除事件
        handler = undefined;
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    // 两点距离计算函数
    function getSpaceDistance(positions) {
        let i = positions.length - 3
        // 根据经纬度获取弧度
        let pointCartographic1 = Cesium.Cartographic.fromCartesian(positions[i])
        let pointCartographic2 = Cesium.Cartographic.fromCartesian(positions[i + 1])
        getTerrainDistance(pointCartographic1, pointCartographic2)
    }
    function getTerrainDistance(poin1, poin2) {
        var geodesic = new Cesium.EllipsoidGeodesic();
        geodesic.setEndPoints(poin1, poin2);
        var s = geodesic.surfaceDistance;
        var cartoPts = [poin1];
        for (let i = 1000; i < s; i += 1000) {
            var cartoPt = geodesic.interpolateUsingSurfaceDistance(i);
            cartoPts.push(cartoPt);
        }
        cartoPts.push(poin2);
        // 返回两点之间的距离
        var promise = Cesium.sampleTerrain(viewer.terrainProvider, 2, cartoPts);

        // 使用promise格式
        promise.then(function (updatedPositions) {
            // console.log(updatedPositions);
            // 初始化距离
            let distance = 0;
            for (let i = 0; i < updatedPositions.length - 1; i++) {
                var geoD = new Cesium.EllipsoidGeodesic();
                geoD.setEndPoints(updatedPositions[i], updatedPositions[i + 1]);
                var innerS = geoD.surfaceDistance;
                innerS = Math.sqrt(
                    Math.pow(innerS, 2) +
                    Math.pow(
                        updatedPositions[i + 1].height - updatedPositions[i].height,
                        2
                    )
                );
                distance += innerS;
            }

            // 在三维场景中添加 label
            var textDisance =
                distance > 10000
                    ? (distance / 1000.0).toFixed(2) + "公里"
                    : (distance / 500.0).toFixed(2) + "里";
            viewer.entities.add({
                name: "_range",
                position: labelPt,
                point: {
                    poixeSize: 4,
                    color: Cesium.Color.RED,
                    outlineColor: Cesium.Color.MINTCREAM,
                    outlineWidth: 2,
                },
                label: {
                    text: textDisance,
                    font: "18px sans-serif",
                    fillColor: Cesium.Color.GOLD,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outLineWidth: 2,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(0, -10),
                },
            });
        });
    }
    // 创建一个多段线类 
    class PolyLinePrimitive {
        constructor(positions) {
            // 定义多段线的属性
            this.options = {
                name: "_range",
                // 多段线的名称
                polyline: {
                    show: true, // 多段线是否可见
                    positions: [],// 多段线的位置    
                    material: Cesium.Color.CORNFLOWERBLUE,  // 多段线的颜色 
                    width: 3, // 多段线的宽度 
                    clampToGround: true // 多段线是否贴合地形 
                }
            };
            this.positions = positions; // 保存位置数组 
            this.init(); // 调用初始化方法
        }
        init() {
            let update = () => {
                return this.positions;
            };
            // 使用CallbackProperty来动态更新多段线的位置
            this.options.polyline.positions = new Cesium.CallbackProperty(update, false);
            // 把多段线实体添加到Viewer对象中
            viewer.entities.add(this.options);
        }
    }

}

const removeGeometrys = (viewer) => {
    let RangeArea = viewer.entities._entities._array
    for (let i = 0; i < RangeArea.length; i++) {
        if (RangeArea[i]._name === "_range") {
            viewer.entities.remove(RangeArea[i]);
            i--;
        }
    }
}
export {measureArea, removeGeometrys,measureLine}