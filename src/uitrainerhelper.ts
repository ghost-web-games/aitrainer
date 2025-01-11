import IDialog from "@Glibs/interface/idialog";
import IEventController from "@Glibs/interface/ievent";
import { TrainingParam } from "@Glibs/types/agenttypes";
import { EventTypes, UiInfoType } from "@Glibs/types/globaltypes";
import { AttackOption, AttackType } from "@Glibs/types/playertypes";
import Setting, { OptType, Options } from "@Glibs/ux/settings/settings";

export default class UiTrainerHelper {
    apples = 0
    timeScale = 1
    setting = new Setting()
    constructor(
        private eventCtrl: IEventController, 
        private dialog: IDialog,
    ) {
        eventCtrl.SendEventMessage(EventTypes.UiInfo, UiInfoType.LolliBar, 0, 100)
        eventCtrl.RegisterEventListener(EventTypes.TimeCtrl, (scale: number) => {
            if (scale) this.timeScale = scale
        })
        const domId = this.setting.addOption("With Download", { 
            type: OptType.Switches
        })
        this.setting.addOption("Save Training Data", { 
            type: OptType.Buttons,
            onclick: (opt: Options) => {
                const dom = document.getElementById(opt.uniqId) as HTMLInputElement
                const domDownload = document.getElementById(domId) as HTMLInputElement
                eventCtrl.SendEventMessage(EventTypes.AgentSave, dom.value, domDownload.checked, opt)
            }
        })
        this.setting.addOption("Speed", { 
            type: OptType.Selects, name: "_speed", value: [1, 2, 3, 4, 5, 10], onchange: (opt: Options) => {
                const dom = document.getElementById(opt.uniqId) as HTMLSelectElement
                if(!dom) return
                this.timeScale = Number(dom.value)
            }
        })
    }
    RenderHTML() {
        const domUiCenter = document.getElementById("uicenter") as HTMLDivElement;
        domUiCenter.innerText = "EP:0";
        domUiCenter.style.display = "block";
        const domTexter = document.getElementById("uitexter") as HTMLSpanElement;
        domTexter.style.display = "block";
        const domApple = document.getElementById("appleCounter") as HTMLSpanElement;
        domApple.innerText = `x${this.apples}`

        const domSetting = document.getElementById("gamesetting") as HTMLSpanElement;
        domSetting.onclick = () => {
            this.eventCtrl.SendEventMessage(EventTypes.TimeCtrl, 0)
            this.dialog.RenderHtml("Settings", this.setting.GetElements(), {
                close: () => {
                    this.eventCtrl.SendEventMessage(EventTypes.TimeCtrl, this.timeScale)
            }})
            this.dialog.show()
        }

        this.eventCtrl.RegisterEventListener(EventTypes.Attack + "aiagent", (opts: AttackOption[]) => {
            opts.forEach((opt) => {
                switch (opt.type) {
                    case AttackType.Heal:
                        this.apples++
                        domApple.innerText = `x${this.apples}`
                        break;
                }
            })
        })
        this.eventCtrl.RegisterEventListener(EventTypes.AgentEpisode, (param: TrainingParam) => {
            domUiCenter.innerText = "EP:" + param.episode.toString()
            this.apples = param.doneCount
            domApple.innerText = `x${this.apples}`
            this.eventCtrl.SendEventMessage(EventTypes.UiInfo, UiInfoType.LolliBar, (1 - param.epsilon) * 100, 100)
        })
    }
}