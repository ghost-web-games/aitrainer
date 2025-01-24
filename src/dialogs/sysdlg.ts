import ModelStore from "@Glibs/actors/agent/modelstore"
import { GameButton } from "@Glibs/ux/buttons/gamebutton"
import TapButton from "@Glibs/ux/buttons/tapbutton"
import BootModal from "@Glibs/ux/dialog/bootmodal"
import WoodModal from "@Glibs/ux/dialog/woodmodal"

export enum SystemEvent {
    Save,
    Load,
    Down
}

export default class SystemDialog {
    tap: TapButton
    dialog = new BootModal()

    constructor(
        private modelStore: ModelStore,
    ) {
        const woodModal = new WoodModal()
        woodModal.RenderHtml("Settings", "시스템을 설정합니다.")


        const tap = new TapButton(document.body, {
            open: () => { woodModal.show() },
            click: () => { woodModal.hide() },
            close: async () => { await woodModal.hide() }
        })
        tap.addChild(woodModal.GetContentElement())

        const loadBtn = new GameButton()
        loadBtn.RenderHtml({
            title: "Load", click: async () => {
                this.dialog.RenderHtml("Load Ai Card", await this.modelStore.GetModelListElement())
                this.dialog.show()
            }
        })
        woodModal.addChild(loadBtn.dom)

        const downBtn = new GameButton()
        downBtn.RenderHtml({
            title: "Upload", click: () => {
                this.dialog.RenderHtml("Upload Ai Card", this.modelStore.GetUploadElement())
                this.dialog.show()
            }
        })
        woodModal.addChild(downBtn.dom)
        this.tap = tap
    }
    show() {
        this.tap.show()
    }
}