import K from "~/const/const";
import Phaser from "phaser";
import GameScene from "~/scenes/Game";


export default class UI extends Phaser.GameObjects.Container
{
    scene: GameScene
    text: Phaser.GameObjects.Text;
    score:  Phaser.GameObjects.Image;
    hpBar!: Phaser.GameObjects.Image;
    value: number = 0;
    health: number = 2;
    container: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene, x: number, y: number)
    {
        super(scene, x, y)
        this.scene = <GameScene>scene;
        this.score = scene.add.image(0 , 0, K.Score) .setOrigin(0.5,0);
        this.text = scene.add.text( this.score.x+this.score.width/3,  this.score.y+this.score.height/2  , this.value+'', {
            fontFamily: 'Quicksand',
            fontSize: '32px',
            color: '#5D7B95',
            fontStyle: 'normal',
            rtl: true,
            shadow: { color: '#8FA8BE', fill: true, offsetX: 1, offsetY: 2, blur: 1, stroke: false }
        });

        let hpContainer = scene.add.image(0 , -this.score.height, K.HP);
        this.container = hpContainer
        this.hpBar = scene.add.image(0 , -12, K.HpBar);
        this.hpBar.setOrigin(0.5,1).setScale(1, this.health);

        this.add([this.score, this.text, hpContainer, this.hpBar]);
        this.setSize(this.score.width, this.score.height+this.text.height);
    }

    updateHP(value) {
        this.hpBar.setScale(1, value);
    }

    addScore(value) {
        this.value+= value;
        this.text.text = this.value+'';
    }

    setScore(value) {
        this.value = value;
        this.text.text = this.value+'';
    }

    toggleHP(on: boolean) {
        this.hpBar.visible = on;
        this.container.visible = on;
    }

}
