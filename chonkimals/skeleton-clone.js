import * as THREE from 'three';
/**
 * Local port of Three.js r170 SkeletonUtils.clone to support standalone module imports.
 *
 * `Object3D.clone()` alone leaves cloned SkinnedMeshes bound to the SOURCE
 * bones, so every instance would animate together. This rebinds each cloned
 * SkinnedMesh to a cloned skeleton whose bones are the matching cloned nodes.
 */
                                         
                                               
                                 

function parallelTraverse(a          , b          , callback                                    )       {
  callback(a, b);
  for (let i = 0; i < a.children.length; i++) parallelTraverse(a.children[i], b.children[i], callback);
}

export function cloneSkinned                    (source   )    {
  const sourceLookup = new Map                    ();
  const cloneLookup = new Map                    ();
  const clone = source.clone()     ;

  parallelTraverse(source, clone, (sourceNode, clonedNode) => {
    sourceLookup.set(clonedNode, sourceNode);
    cloneLookup.set(sourceNode, clonedNode);
  });

  clone.traverse((node) => {
    if (!(node               ).isSkinnedMesh) return;
    const clonedMesh = node               ;
    const sourceMesh = sourceLookup.get(node)               ;
    clonedMesh.skeleton = sourceMesh.skeleton.clone();
    clonedMesh.bindMatrix.copy(sourceMesh.bindMatrix);
    clonedMesh.skeleton.bones = sourceMesh.skeleton.bones.map((bone) => cloneLookup.get(bone)        );
    clonedMesh.bind(clonedMesh.skeleton, clonedMesh.bindMatrix);
  });

  return clone;
}
