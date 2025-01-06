import IDialog from "@Glibs/interface/idialog";
import IEventController from "@Glibs/interface/ievent";
import { TrainingParam } from "@Glibs/types/agenttypes";
import { EventTypes, UiInfoType } from "@Glibs/types/globaltypes";
import { AttackOption, AttackType } from "@Glibs/types/playertypes";
import Setting, { OptType, Options } from "@Glibs/ux/settings/settings";

export default class UiTexter {
    apples = 0
    setting = new Setting()
    constructor(
        private eventCtrl: IEventController, 
        private dialog: IDialog,
    ) {
        eventCtrl.SendEventMessage(EventTypes.UiInfo, UiInfoType.LolliBar, 0, 100)
        const domId = this.setting.addOption("With Download", false, () => { }, { 
            type: OptType.Switches
        })
        this.setting.addOption("Save Training Data", false, () => { }, { 
            type: OptType.Buttons,
            onclick: (opt: Options) => {
                const dom = document.getElementById(opt.uniqId) as HTMLInputElement
                const domDownload = document.getElementById(domId) as HTMLInputElement
                eventCtrl.SendEventMessage(EventTypes.AgentSave, dom.value, domDownload.checked, opt)
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
                event: () => {
                    this.eventCtrl.SendEventMessage(EventTypes.TimeCtrl, 1)
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
        this.eventCtrl.RegisterEventListener(EventTypes.AgentEpisode, (param: TrainingParam, episode: number) => {
            domUiCenter.innerText = "EP:" + episode.toString()
            this.eventCtrl.SendEventMessage(EventTypes.UiInfo, UiInfoType.LolliBar, (1 - param.epsilon) * 100, 100)
        })
    }
}