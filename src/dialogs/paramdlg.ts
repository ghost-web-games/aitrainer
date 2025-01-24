import ModelStore from "@Glibs/actors/agent/modelstore"
import IEventController from "@Glibs/interface/ievent"
import { EventTypes } from "@Glibs/types/globaltypes"
import { GameButton } from "@Glibs/ux/buttons/gamebutton"
import TapButton from "@Glibs/ux/buttons/tapbutton"
import BootModal from "@Glibs/ux/dialog/bootmodal"
import WoodModal from "@Glibs/ux/dialog/woodmodal"
import Setting, { OptType, Options } from "@Glibs/ux/settings/settings"

export enum SystemEvent {
    Save,
    Load,
    Down
}

export default class ParamDialog {
    tap: TapButton
    dialog = new BootModal()
    settings = new Setting()
    timeScale = 1

    constructor(
        private eventCtrl: IEventController,
        private modelStore: ModelStore,
    ) {
        this.settings.addOption("Randomness", { type: OptType.Inputs, value: [0.995] })
        this.settings.addLine()
        this.settings.addOption("Auto Save",  { type: OptType.Switches })
        this.settings.addLine()
        this.settings.addOption("Speed", { 
            type: OptType.Selects, name: "_speed", value: [1, 2, 3, 4, 5, 10], onchange: (opt: Options) => {
                const dom = document.getElementById(opt.uniqId) as HTMLSelectElement
                if(!dom) return
                this.timeScale = Number(dom.value)
                eventCtrl.SendEventMessage(EventTypes.TimeCtrl, this.timeScale)
            }
        })
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
            title: "Training Param Setting", click: async () => {
                this.dialog.RenderHtml("Settings", this.settings.GetElements())
                this.dialog.show()
            }
        })
        woodModal.addChild(loadBtn.dom)

        this.tap = tap
    }
    show() {
        this.tap.show()
    }
}