import * as Cesium from "cesium";
export const clip = (viewer) => {

    var positions = [] // 记录位置
    let points = []
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
        points.push(cartesian)
        // 记录鼠标单击时的位置，异步计算贴地距离
        labelPt = positions[positions.length - 1]
        //在三维场景中添加圆点
        viewer.entities.add({
            name: '_range',
            position: labelPt,
            point: {
                pixelSize: 5,
                color: Cesium.Color.RED,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 2,
            },
        });

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
        positions.push(positions[0]);
        points.push(cartesian)
        // 记录鼠标单击时的节点位置，异步计算贴地距离
        labelPt = positions[positions.length - 2];
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
        handler.destroy(); // 删除事件
        handler = undefined;
        draw(points ,viewer)

    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

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
            // 定义一个更新函数，用来返回多段线的位置
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

function draw(points,viewer) {

    let clippingPlanes = []
    const pointsLength = points.length;
    //闭环
    points.push(points[0])
    //数组反转
    points = points.reverse();
    //数组反转
    for (let i = 0; i < pointsLength; ++i) {
        const nextIndex = (i + 1) % pointsLength;
        let midpoint = Cesium.Cartesian3.add(
            points[i],
            points[nextIndex],
            new Cesium.Cartesian3()
        );
        midpoint = Cesium.Cartesian3.multiplyByScalar(
            midpoint,
            0.5,
            midpoint
        );

        const up = Cesium.Cartesian3.normalize(
            midpoint,
            new Cesium.Cartesian3()
        );
        let right = Cesium.Cartesian3.subtract(
            points[nextIndex],
            midpoint,
            new Cesium.Cartesian3()
        );
        right = Cesium.Cartesian3.normalize(right, right);

        let normal = Cesium.Cartesian3.cross(
            right,
            up,
            new Cesium.Cartesian3()
        );
        normal = Cesium.Cartesian3.normalize(normal, normal);
        const originCenteredPlane = new Cesium.Plane(normal, 0.0);
        const distance = Cesium.Plane.getPointDistance(
            originCenteredPlane,
            midpoint
        );
        clippingPlanes.push(new Cesium.ClippingPlane(normal, distance));

    }
    viewer.scene.globe.clippingPlanes =
        new Cesium.ClippingPlaneCollection({
            planes: clippingPlanes,
            edgeWidth: 1,
            unionClippingRegions: false,
            // 设置高度参考系为NONE
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        });
    // 侧边墙体
    viewer.entities.add({
        name: '_range',
        corridor: {
            positions: [
                ...points,
                points[1]
            ],
            height: 20 * -1,
            extrudedHeight: 0,
            width: 1,
            cornerType: Cesium.CornerType.ROUNDED,
            material: Cesium.Color.fromCssColorString(`rgba(66,187,133,1)`),

            outline: false,

            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
    });
    //底部墙体
    viewer.entities.add({
        name: '_range',
        polygon: {
            hierarchy: points,
            height: 20 * -1,
            extrudedHeight: 20 * -1 + 1,
            material: Cesium.Color.YELLOW,

            heightReference: Cesium.HeightReference.NONE,
        },
    });
}