
import * as Cesium from "cesium";
//淹没分析
export const submerge = (viewer) => {

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
        let waterHeight = 0; // 当前淹没高度
        viewer.entities.add({
            name: '_range',
            polygon: {
                hierarchy: positions,
                material: Cesium.Color.BLUE.withAlpha(0.3),
                extrudedHeight: new Cesium.CallbackProperty(function () {
                    return waterHeight;
                }, false),
                show: true
            }
        });
        viewer.clock.onTick.addEventListener(function () {
            if (waterHeight > 50) {
                waterHeight = 0;
            }
            waterHeight += 0.1;
        })
        handler.destroy(); // 删除事件
        handler = undefined;
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