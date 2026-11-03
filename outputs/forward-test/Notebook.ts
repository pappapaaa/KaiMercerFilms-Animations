import * as THREE from 'three';
import {outlinedBox} from '../../templates/bridge/Props';

/** Original small notebook. Origin is the bottom center, so y=deskTop rests on the desk.
 * Dimensions: .56 wide, .09 thick, .74 deep. It has no source-video imagery or text. */
export function makeNotebook() {
  const root = new THREE.Group();
  root.name = 'Original plum pocket notebook';
  const cover = '#71647d';
  const ink = '#282534';
  const addBox = (w:number,h:number,d:number,color:string,y:number,r=.0035) => {
    const piece = outlinedBox(w,h,d,color,ink,r);
    piece.position.y = y;
    root.add(piece);
    return piece;
  };
  addBox(.56,.025,.74,cover,.0125);
  addBox(.50,.04,.68,'#f6e8ca',.045,.002);
  addBox(.56,.025,.74,cover,.0775);
  // A narrow spine, a paper label and a yellow ribbon communicate "notebook" at small scale.
  const spine = addBox(.035,.09,.74,'#493e5c',.045,.002);
  spine.position.x = -.2625;
  const label = new THREE.Mesh(new THREE.BoxGeometry(.25,.002,.17),new THREE.MeshBasicMaterial({color:'#f5e1b4'}));
  label.position.set(.03,.091,-.08);root.add(label);
  const ribbon = new THREE.Mesh(new THREE.BoxGeometry(.055,.006,.17),new THREE.MeshBasicMaterial({color:'#dfaf46'}));
  ribbon.position.set(.14,.037,.39);root.add(ribbon);
  return root;
}
