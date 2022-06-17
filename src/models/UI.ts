import K from "~/const/TextureKeys";
import Phaser from "phaser";
import GameScene from "~/scenes/Game";


export default class UI extends Phaser.GameObjects.Container
{
    scene: GameScene
    score: Phaser.GameObjects.Image;
    value: number = 0;
    body!: Phaser.Physics.Arcade.Body

    private readonly text: Phaser.GameObjects.Text;
    private readonly hpBar!: Phaser.GameObjects.Sprite;

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

        this.hpBar = scene.add.sprite(0 , -12, K.Face);
        this.hpBar.setOrigin(0.5,1);

        this.add([this.score, this.text, this.hpBar]);
        this.setSize(this.score.width, this.score.height+this.text.height);

        this.scene.physics.add.existing(this)
        this.body.setImmovable(true);
        this.body.setAllowGravity(false);
        this.setDepth(5)
    }

    updateHP(value) {
        this.hpBar.setFrame(this.scene.MAX_HEALTH - value);
    }

    addScore(value) {
        this.value+= value;
        this.text.text = this.value+'';
    }

    setScore(value) {
        this.value = value;
        this.text.text = this.value+'';
        return this
    }

    toggleHP(on: boolean) {
        this.hpBar.visible = on;
        return this;
    }

}

Phaser.GameObjects.GameObjectFactory.register(
    'UI',
    function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number) {
        return this.displayList.add(new UI(this.scene, x, y))
    }
)