
import Phaser from "phaser";
import GameScene from "~/scenes/Game";
import {bgColor} from "~/main";
import K from "~/const/TextureKeys";


export default class Credits extends Phaser.GameObjects.Container
{
    scene: GameScene
    button: Phaser.GameObjects.Text;
    table;
    container: Phaser.GameObjects.Group;

    constructor(scene: Phaser.Scene, x: number, y: number)
    {
        super(scene, x, y)
        this.scene = <GameScene>scene;

        this.button = scene.add.text( 0,  0  , '[Credits]', {
            fontFamily: 'Comic Neue',
            fontSize: '24px',
            color: '#fff',
            backgroundColor: '#8585858F',
            shadow: {stroke: true, blur: 9, color: bgColor, fill: true}
        })  .setInteractive({cursor: 'pointer'})
            .setOrigin(0.5, 1)
            .on('pointerup', () =>
                this.container.toggleVisible()
            )
        this.container = scene.add.group()
        this.table = scene.add.rectangle(0, 0 -this.button.height*1.5-10, scene.scale.width/2, scene.scale.height/3-10, 0x888888, 0.75)
            .setOrigin(0.5, 1)

        let seedmancA = scene.add.image(this.table.getTopLeft().x+5, this.table.getTopLeft().y+5, K.Seedmanc).setOrigin(0, 0)
        let seedmancT = scene.add.text( this.table.getTopCenter().x,  this.table.getTopCenter().y+5 + seedmancA.height/2, 'Seedmanc', {
            fontFamily: 'Quicksand',
            fontSize: '32px',
            color: '#fff',
            stroke: '#FFFFFF',
            strokeThickness: 1
        }).setOrigin(0.85, 0.5)
        let seedmancR = scene.add.text( this.table.getTopRight().x-10,  this.table.getTopRight().y+7 + seedmancA.height/2, 'Idea & coding', {
            fontFamily: 'Quicksand',
            fontSize: '24px',
            color: '#fff',
            stroke: '#FFFFFF',
        }).setOrigin(1, 0.5)

        let alterA = scene.add.image(this.table.getTopLeft().x+5, this.table.getTopLeft().y+10 + seedmancA.height, K.Alter).setOrigin(0, 0)
        let alterT = scene.add.text( this.table.getTopCenter().x,  this.table.getTopCenter().y+10 + seedmancA.height*1.5, 'AlterEichwald', {
            fontFamily: 'Quicksand',
            fontSize: '32px',
            color: '#fff',
            stroke: '#FFFFFF',
            strokeThickness: 1
        }).setOrigin(0.78, 0.5)
        let alterR = scene.add.text( this.table.getTopRight().x-10,  this.table.getTopRight().y+10 + seedmancA.height*1.5, 'Design & motive', {
            fontFamily: 'Quicksand',
            fontSize: '24px',
            color: '#fff',
            stroke: '#FFFFFF',
        }).setOrigin(1, 0.5)

        let nanoA = scene.add.image(this.table.getTopLeft().x+5, this.table.getTopLeft().y+15 + seedmancA.height*2, K.Nanodesu).setOrigin(0, 0)
        let nanoT = scene.add.text( this.table.getTopCenter().x,  this.table.getTopCenter().y+10 + seedmancA.height*2.5, 'nanodesuP', {
            fontFamily: 'Quicksand',
            fontSize: '32px',
            color: '#fff',
            stroke: '#FFFFFF',
            strokeThickness: 1
        }).setOrigin(0.85, 0.5)
        let nanoR = scene.add.text( this.table.getTopRight().x-10,  this.table.getTopRight().y+10 + seedmancA.height*2.5, 'Testing & support', {
            fontFamily: 'Quicksand',
            fontSize: '24px',
            color: '#fff',
            stroke: '#FFFFFF',
        }).setOrigin(1, 0.5)

        let youA = scene.add.image(this.table.getTopLeft().x+5, this.table.getTopLeft().y+20 + seedmancA.height*3, K.You).setOrigin(0, 0).setScale(1,0.75)
        let youT = scene.add.text( this.table.getTopCenter().x,  this.table.getTopCenter().y+10 + seedmancA.height*3.5, 'You', {
            fontFamily: 'Quicksand',
            fontSize: '26px',
            color: '#fff',
            stroke: '#FFFFFF',
            strokeThickness: 1
        }).setOrigin(2 , 0.5)
        let youR = scene.add.text( this.table.getTopRight().x-10,  this.table.getTopRight().y+10 + seedmancA.height*3.5, 'Could\'ve been here', {
            fontFamily: 'Quicksand',
            fontSize: '23px',
            color: '#fff',
            stroke: '#FFFFFF',
        }).setOrigin(1, 0.5)


        this.add([this.button, this.table, seedmancA, seedmancT, seedmancR, alterA, alterT, alterR, nanoA, nanoT, nanoR, youA, youT, youR]);
        this.container.addMultiple([this.table, seedmancA, seedmancT, seedmancR, alterA, alterT, alterR, nanoA, nanoT, nanoR, youA, youT, youR])
            .setVisible(false)
        this.setDepth(5)
    }
}