"use strict";

Hooks.on('renderTokenConfig', (app, html, data) => {
  //console.log(app, html, data);
  if(app.isPrototype)
  {
    let updateAll = $(`<button title="Update all of the tokens of this actor, everywhere."><i class="fas fa-save"></i> Update All</button>`);
    html.find('.sheet-footer').append(updateAll);
    updateAll.on('click', async function(event) {
      if(app._submitting) return;
      let data = await app._onSubmit(new Event("submit"));
      //console.log(data);
      
      let content = ``;
      for(let prop in data)
      {
        if(['x','y','elevation','rotation','lockRotation'].indexOf(prop) == -1)
        content = content + `<div><input class="select-property" type="checkbox" id="${prop}" checked="checked"/> <label for="${prop}"><b>${prop}</b> (<i>${data[prop]}</i>)</label></div>`;
      }
      
      new Dialog({
        title: `Update All Tokens`,
        content,
        buttons: {
          save: {
            icon: '<i class="fas fa-save"></i>',
            label: "Save",
            callback: async function(dialog) {
              let newData = {};
              let selected = dialog.find("input.select-property:checked");
              for(let i=0; i<selected.length; i++)
                newData[selected[i].id] = data[selected[i].id];
              let tokensUpdated = 0;
              let scenesUpdated = 0;
              for(let scene of game.scenes)
              {
                let updated = false;
                for(let token of scene.tokens)
                {
                  if(token?.actor?.id === app.actor.id)
                  {
                    await token.update(newData);
                    tokensUpdated++;
                    updated = true;
                  }
                }
                if(updated)
                  scenesUpdated++;
              }
              ui.notifications.info(`${tokensUpdated} tokens updated across ${scenesUpdated} scenes.`);
            }
          },
          no: {
            icon: '<i class="fas fa-times"></i>',
            label: "Cancel"
          }
        },
        default: "save"
      }, {
        width: 500
      }).render(true);
    });
  }
});
