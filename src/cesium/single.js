

import * as Cesium from "cesium";


export const single = (viewer) => {
    const selected = {
        feature: undefined,
        originalColor: new Cesium.Color(),
    };
    const clickHandler = viewer.screenSpaceEventHandler.getInputAction(
        Cesium.ScreenSpaceEventType.LEFT_CLICK
    );

    if (
        Cesium.PostProcessStageLibrary.isSilhouetteSupported(viewer.scene)
    ) {
        //支持后期处理
        const silhouetteBlue = Cesium.PostProcessStageLibrary.createEdgeDetectionStage();
        silhouetteBlue.uniforms.color = Cesium.Color.BLUE;
        silhouetteBlue.uniforms.length = 0.01;
        silhouetteBlue.selected = [];

        const silhouetteGreen = Cesium.PostProcessStageLibrary.createEdgeDetectionStage();
        silhouetteGreen.uniforms.color = Cesium.Color.LIME;
        silhouetteGreen.uniforms.length = 0.01;
        silhouetteGreen.selected = [];

        viewer.scene.postProcessStages.add(
            Cesium.PostProcessStageLibrary.createSilhouetteStage([
                silhouetteBlue,
                silhouetteGreen,
            ])
        );
        // Silhouette a feature blue on hover.
        viewer.screenSpaceEventHandler.setInputAction(
            function onMouseMove(movement) {
                // If a feature was previously highlighted, undo the highlight
                silhouetteBlue.selected = [];

                // Pick a new feature
                const pickedFeature = viewer.scene.pick(movement.endPosition);


                if (!Cesium.defined(pickedFeature)) {
                    return;
                }

                // Highlight the feature if it's not already selected.
                if (pickedFeature !== selected.feature) {
                    silhouetteBlue.selected = [pickedFeature];
                }
            },
            Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        // Silhouette a feature on selection and show metadata in the InfoBox.
        viewer.screenSpaceEventHandler.setInputAction(
            function onLeftClick(movement) {
                // If a feature was previously selected, undo the highlight
                silhouetteGreen.selected = [];

                // Pick a new feature
                const pickedFeature = viewer.scene.pick(movement.position);
                if (!Cesium.defined(pickedFeature)) {
                    clickHandler(movement);
                    return;
                }

                // Select the feature if it's not already selected
                if (silhouetteGreen.selected[0] === pickedFeature) {
                    return;
                }

                // Save the selected feature's original color
                const highlightedFeature = silhouetteBlue.selected[0];
                if (pickedFeature === highlightedFeature) {
                    silhouetteBlue.selected = [];
                }

                // Highlight newly selected feature
                silhouetteGreen.selected = [pickedFeature];

            },
            Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
    else {
        const highlighted = {
            feature: undefined,
            originalColor: new Cesium.Color(),
        };

        // Color a feature yellow on hover.
        viewer.screenSpaceEventHandler.setInputAction(
            function onMouseMove(movement) {

                if (Cesium.defined(highlighted.feature)) {
                    highlighted.feature.color = highlighted.originalColor;
                    highlighted.feature = undefined;
                }
                // Pick a new feature
                const pickedFeature = viewer.scene.pick(movement.endPosition);

                if (!Cesium.defined(pickedFeature)) {
                    return;
                }

                // Highlight the feature if it's not already selected.
                if (pickedFeature !== selected.feature) {
                    highlighted.feature = pickedFeature;
                    Cesium.Color.clone(
                        pickedFeature.color,
                        highlighted.originalColor
                    );
                    pickedFeature.color = Cesium.Color.YELLOW;
                }
            },
            Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        // Color a feature on selection and show metadata in the InfoBox.
        viewer.screenSpaceEventHandler.setInputAction(
            function onLeftClick(movement) {
                // If a feature was previously selected, undo the highlight
                if (Cesium.defined(selected.feature)) {
                    selected.feature.color = selected.originalColor;
                    selected.feature = undefined;
                }
                // Pick a new feature
                const pickedFeature = viewer.scene.pick(movement.position);
                if (!Cesium.defined(pickedFeature)) {
                    clickHandler(movement);
                    return;
                }
                // Select the feature if it's not already selected
                if (selected.feature === pickedFeature) {
                    return;
                }
                selected.feature = pickedFeature;
                // Save the selected feature's original color
                if (pickedFeature === highlighted.feature) {
                    Cesium.Color.clone(
                        highlighted.originalColor,
                        selected.originalColor
                    );
                    highlighted.feature = undefined;
                } else {
                    Cesium.Color.clone(pickedFeature.color, selected.originalColor);
                }
                // Highlight newly selected feature
                pickedFeature.color = Cesium.Color.LIME;

                // Set feature infobox description
                viewer.selectedEntity = selectedEntity;
                selectedEntity.description = createPickedFeatureDescription(
                    pickedFeature
                );
            },
            Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
}

