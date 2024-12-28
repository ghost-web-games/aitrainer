import { TraingParam } from "@Glibs/actors/agent/trainer";
import IEventController from "@Glibs/interface/ievent";
import { EventTypes, UiInfoType } from "@Glibs/types/globaltypes";
import { AttackOption, AttackType } from "@Glibs/types/playertypes";

export default class UiTexter {
    apples = 0
    constructor(
        private eventCtrl: IEventController, 
    ) {
        const domUiCenter = document.getElementById("uicenter") as HTMLDivElement;
        domUiCenter.innerText = "EP:0";
        const domApple = document.getElementById("appleCounter") as HTMLSpanElement;
        domApple.innerText = `x${this.apples}`

        eventCtrl.SendEventMessage(EventTypes.UiInfo, UiInfoType.LolliBar, 0, 100)
        eventCtrl.RegisterEventListener(EventTypes.Attack + "aiagent", (opts: AttackOption[]) => {
            opts.forEach((opt) => {
                switch (opt.type) {
                    case AttackType.Heal:
                        this.apples++
                        domApple.innerText = `x${this.apples}`
                        break;
                }
            })
        })
        eventCtrl.RegisterEventListener(EventTypes.AgentEpisode, (param: TraingParam, episode: number) => {
            domUiCenter.innerText = "EP:" + episode.toString()
            eventCtrl.SendEventMessage(EventTypes.UiInfo, UiInfoType.LolliBar, (1 - param.epsilon) * 100, 100)
        })

    }

}