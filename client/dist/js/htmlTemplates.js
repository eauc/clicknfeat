angular.module('clickApp.services').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('app/components/compat_check/compat_check.html',
    "<p class=compat-warning ng-show=compat_error>Your browser is missing crucial features ({{compat_error.join(', ')}}). You should update it.</p>"
  );


  $templateCache.put('app/components/error_toaster/error_toaster.html',
    "<div class=error-toaster>{{ msg }}</div>"
  );


  $templateCache.put('app/components/game/bad_dice_notification/bad_dice_notification.html',
    "<audio src=/data/sound/naindows-hahaha02.wav></audio>"
  );


  $templateCache.put('app/components/game/chat_box/game_chat_box.html',
    "<div><form ng-submit=game_chat.doSendChatMessage()><div class=input-group><span class=input-group-btn><button type=submit class=\"btn btn-default\">Send</button></span> <input class=form-control placeholder=Msg... ng-model=\"game_chat.msg\"></div></form><div class=chat-list><div class=chat ng-repeat=\"c in game_chat.chat track by c.stamp\">{{ c.from }} ➝ {{c.msg}}</div></div></div>"
  );


  $templateCache.put('app/components/game/cmd_osd/cmd_osd.html',
    "<div class=scroll-container><div class=mode-title><strong>{{game.currentModeName()}}</strong></div><div class=btn-group-vertical><button class=\"btn btn-default\" title=\"{{game.action.bindings['modeBackToDefault'] || ''}}\" ng-click=\"game.doModeAction('modeBackToDefault')\">Back To Default</button> <button class=\"btn btn-default\" title=\"{{game.action.bindings['viewFlipMap'] || ''}}\" ng-click=\"game.doModeAction('viewFlipMap')\">Flip Map</button> <button ng-repeat=\"action in game.action.buttons\" class=\"btn {{:: (action.length === 3 && action[1] !== 'toggle') ? 'btn-info' : 'btn-default' }}\" title=\"{{::game.action.bindings[action[1]] || ''}}\" ng-click=game.doActionButton(action) ng-show=\"action[1] === 'toggle' ||\n" +
    "                     action.length === 2 ||\n" +
    "                     game.show_action_group === action[2]\n" +
    "                     \">{{action[0]}} <span class=\"glyphicon {{ action[1] === 'toggle' ? (game.show_action_group === action[2] ? 'glyphicon-chevron-up' : 'glyphicon-chevron-down') : '' }}\"></span></button></div></div>"
  );


  $templateCache.put('app/components/game/create_model/create_model.html',
    "<circle class=create-model ng-attr-cx={{render.x}} ng-attr-cy={{render.y}} ng-attr-r={{render.radius}}></circle>"
  );


  $templateCache.put('app/components/game/create_template/create_template.html',
    "<g><circle ng-show=\"pos.type==='aoe'\" class=create-template-aoe ng-attr-cx={{pos.x}} ng-attr-cy={{pos.y}} r=15></circle><polygon ng-show=\"pos.type==='spray'\" class=create-template-spray points=\"8.75,0 5.125,-59 10,-60 14.875,-59 11.25,0\" ng-attr-transform={{pos.transform}}></polygon><rect ng-show=\"pos.type==='wall'\" class=create-template-wall ng-attr-x={{pos.x}} ng-attr-y={{pos.y}} width=40 height=7.5></rect></g>"
  );


  $templateCache.put('app/components/game/create_terrain/create_terrain.html',
    "<rect class=create-terrain ng-attr-x={{render.x}} ng-attr-y={{render.y}} ng-attr-width={{render.width}} ng-attr-height={{render.height}}></rect>"
  );


  $templateCache.put('app/components/game/deploiement/deploiement.html',
    "<g><line x1=0 y1=70 x2=480 y2=70 class=deploiement-line></line><line x1=0 y1=90 x2=480 y2=90 class=extended-deploiement-line></line><line x1=0 y1=130 x2=480 y2=130 class=advance-deploiement-line></line><line x1=0 y1=150 x2=480 y2=150 class=extended-advance-deploiement-line></line><line x1=0 y1=100 x2=480 y2=100 class=deploiement-line></line><line x1=0 y1=120 x2=480 y2=120 class=extended-deploiement-line></line><line x1=0 y1=160 x2=480 y2=160 class=advance-deploiement-line></line><line x1=0 y1=180 x2=480 y2=180 class=extended-advance-deploiement-line></line><line x1=0 y1=380 x2=480 y2=380 class=deploiement-line></line><line x1=0 y1=360 x2=480 y2=360 class=extended-deploiement-line></line><line x1=0 y1=320 x2=480 y2=320 class=advance-deploiement-line></line><line x1=0 y1=300 x2=480 y2=300 class=extended-advance-deploiement-line></line><line x1=0 y1=410 x2=480 y2=410 class=deploiement-line></line><line x1=0 y1=390 x2=480 y2=390 class=extended-deploiement-line></line><line x1=0 y1=350 x2=480 y2=350 class=advance-deploiement-line></line><line x1=0 y1=330 x2=480 y2=330 class=extended-advance-deploiement-line></line><line x1=0 y1=30 x2=480 y2=30 class=ambush-line></line><line x1=30 y1=0 x2=30 y2=480 class=ambush-line></line><line x1=0 y1=450 x2=480 y2=450 class=ambush-line></line><line x1=450 y1=0 x2=450 y2=480 class=ambush-line></line><g id=deploiement-labels><rect x=0 y=58 width=1.2em height=1em class=dep-label></rect><text x=0 y=69 class=dep-label>7\"</text><rect x=0 y=122 width=1.8em height=1em class=dep-label-sm></rect><text x=0 y=129 class=dep-label-sm>13\"</text><rect x=0 y=88 width=1.8em height=1em class=dep-label></rect><text x=0 y=99 class=dep-label>10\"</text><rect x=0 y=152 width=1.8em height=1em class=dep-label-sm></rect><text x=0 y=159 class=dep-label-sm>16\"</text><rect x=0 y=368 width=1.8em height=1em class=dep-label></rect><text x=0 y=379 class=dep-label>10\"</text><rect x=0 y=312 width=1.8em height=1em class=dep-label-sm></rect><text x=0 y=319 class=dep-label-sm>16\"</text><rect x=0 y=398 width=1.2em height=1em class=dep-label></rect><text x=0 y=409 class=dep-label>7\"</text><rect x=0 y=342 width=1.8em height=1em class=dep-label-sm></rect><text x=0 y=349 class=dep-label-sm>13\"</text></g></g>"
  );


  $templateCache.put('app/components/game/dice_box/dice_box.html',
    "<div><div class=btn-group><button class=\"btn btn-default\" title=\"{{game.action.bindings['roll1D6'] || ''}}\" ng-click=\"dice_box.doRollDice(6, 1)\">1D6</button> <button class=\"btn btn-default\" title=\"{{game.action.bindings['roll2D6'] || ''}}\" ng-click=\"dice_box.doRollDice(6, 2)\">2D6</button> <button class=\"btn btn-default\" title=\"{{game.action.bindings['roll3D6'] || ''}}\" ng-click=\"dice_box.doRollDice(6, 3)\">3D6</button> <button class=\"btn btn-default\" title=\"{{game.action.bindings['roll4D6'] || ''}}\" ng-click=\"dice_box.doRollDice(6, 4)\">4D6</button> <button class=\"btn btn-default\" title=\"{{game.action.bindings['roll5D6'] || ''}}\" ng-click=\"dice_box.doRollDice(6, 5)\">5D6</button> <button class=\"btn btn-default\" title=\"{{game.action.bindings['roll1D3'] || ''}}\" ng-click=\"dice_box.doRollDice(3, 1)\">1D3</button></div><div class=dice-list><div ng-repeat=\"(i, die)\n" +
    "                    in dice_box.dice\n" +
    "                    track by die.stamp\"><span class=text-primary>[{{::die.user}}]</span> {{::die.desc}}</div></div></div>"
  );


  $templateCache.put('app/components/game/edit_damage/edit_damage.html',
    "<click-game-model-damage info=info.damage state=selection.state></click-game-model-damage>"
  );


  $templateCache.put('app/components/game/edit_label/edit_label.html',
    "<form ng-submit=edit_label.doAddLabel()><input ng-model=edit_label.new_label ng-change=\"edit_label.doRefresh()\"></form>"
  );


  $templateCache.put('app/components/game/label/element_label.html',
    "<g ng-show=label.show class=label ng-attr-transform={{label.transform}}><rect height=6 ng-attr-x={{label.bkg_x}} ng-attr-y={{label.bkg_y}} ng-attr-width={{label.bkg_width}}></rect><text ng-attr-x={{label.x}} ng-attr-y={{label.y}}>{{label.text}}</text></g>"
  );


  $templateCache.put('app/components/game/los/los.html',
    "<g><line style=\"marker-start: url(#los-start);\n" +
    "               marker-end: url(#los-end)\" ng-show=render.local.show ng-attr-x1={{render.local.x1}} ng-attr-y1={{render.local.y1}} ng-attr-x2={{render.local.x2}} ng-attr-y2={{render.local.y2}}></line><line style=\"marker-start: url(#los-start);\n" +
    "               marker-end: url(#los-end)\" ng-show=render.remote.show ng-attr-x1={{render.remote.x1}} ng-attr-y1={{render.remote.y1}} ng-attr-x2={{render.remote.x2}} ng-attr-y2={{render.remote.y2}}></line><circle class=los-origin ng-if=render.origin ng-attr-cx={{render.origin.cx}} ng-attr-cy={{render.origin.cy}} ng-attr-r={{render.origin.radius}}></circle><circle class=los-target ng-if=render.target ng-attr-cx={{render.target.cx}} ng-attr-cy={{render.target.cy}} ng-attr-r={{render.target.radius}}></circle></g>"
  );


  $templateCache.put('app/components/game/los/los_enveloppe.html',
    "<g ng-show=render.display><polygon class=los-enveloppe ng-attr-points={{render.enveloppe}}></polygon><polygon ng-repeat=\"shadow in render.shadow\" class=los-shadow style=\"clip-path: url(#los-clip)\" ng-attr-points={{shadow}}></polygon><polygon ng-repeat=\"darkness in render.darkness\" class=los-darkness style=\"clip-path: url(#los-clip)\" ng-attr-points={{darkness}}></polygon></g>"
  );


  $templateCache.put('app/components/game/model/damage/model_damage.html',
    "<div><strong>Total :</strong> <span ng-show=damage.state>{{damage.state.dmg.t}} /</span>{{damage.info.total}} <span ng-if=damage.info.field>+ <span ng-show=damage.state>{{damage.state.dmg.f}} /</span>{{damage.info.field}}</span> <button class=\"btn btn-default\" ng-show=damage.state ng-click=damage.doResetDamage()>Reset</button><div ng-if=\"damage.info.type == 'warrior'\" class=damage-warrior><div ng-repeat=\"i in damage.range(damage.info.n)\" class=\"damage-box {{ damage.warriorBoxClass(i) }}\" ng-click=damage.doWarriorDamage(i+1)></div></div><table class=damage-grid ng-if=damage.info.field><tr ng-repeat=\"line in [0, 1]\"><td ng-repeat=\"col in damage.range(damage.info.field/2)\" class=\"damage-box {{ damage.fieldBoxClass(col, line) }}\" ng-click=\"damage.doFieldDamage(line * damage.info.field/2 + col + 1)\">F</td></tr></table><table ng-if=\"damage.info.type === 'jack' ||\n" +
    "                damage.info.type === 'gargantuan' ||\n" +
    "                damage.info.type === 'beast'\n" +
    "                \" class=damage-grid><tr><td ng-repeat=\"col in ['1','2','3','4','5','6']\" class=damage-col-header ng-click=damage.doGridColDamage(col)>{{::col}}</td></tr><tr ng-repeat=\"line in damage.range(damage.info.depth)\"><td ng-repeat=\"col in ['1','2','3','4','5','6']\" class=\"damage-box {{ damage.gridBoxClass(col, line) }}\" ng-click=\"damage.doGridDamage(line, col)\">{{ (!damage.info[col][line] || damage.info[col][line] === 'b') ? ' ' : damage.info[col][line].toUpperCase() }}</td></tr></table><table ng-if=\"damage.info.type === 'colossal'\" class=damage-grid><tr><td ng-repeat=\"col in ['L1','L2','L3','L4','L5','L6','R1','R2','R3','R4','R5','R6']\" class=damage-col-header ng-click=damage.doGridColDamage(col)>{{::col}}</td></tr><tr ng-repeat=\"line in [0,1,2,3,4,5]\"><td ng-repeat=\"col in ['L1','L2','L3','L4','L5','L6','R1','R2','R3','R4','R5','R6']\" class=\"damage-box {{ damage.gridBoxClass(col, line) }}\" ng-click=\"damage.doGridDamage(line, col)\">{{ (!damage.info[col][line] || damage.info[col][line] === 'b') ? ' ' : damage.info[col][line].toUpperCase() }}</td></tr></table></div>"
  );


  $templateCache.put('app/components/game/model/models_list.html',
    "<g ng-repeat=\"(i,model) in state.game.models[type] track by model.state.stamp\" click-game-model ng-attr-transform={{model.render.transform}} ng-class=\"{\n" +
    "             'remote-selection': model.selection.remote,\n" +
    "             'local-selection': model.selection.local,\n" +
    "             'single-remote': model.selection.single_remote,\n" +
    "             'single-local': model.selection.single_local\n" +
    "             }\"><circle class=model-base data-stamp={{model.render.stamp}} ng-attr-cx={{model.render.cx}} ng-attr-cy={{model.render.cy}} ng-attr-r={{model.render.radius}} ng-style=\"{\n" +
    "                    fill: model.render.base_color,\n" +
    "                    }\"><title>{{model.render.title}}</title></circle><line class=model-los ng-attr-x1={{model.render.cx}} ng-attr-y1={{model.render.cy}} ng-attr-x2={{model.render.dx}} ng-attr-y2={{model.render.dy}}></line><line class=model-los ng-attr-x1={{model.render.flx}} ng-attr-y1={{model.render.cy}} ng-attr-x2={{model.render.frx}} ng-attr-y2={{model.render.cy}}></line><image class=model-image x=0 y=0 ng-show=model.render.img ng-attr-width={{model.render.width}} ng-attr-height={{model.render.height}} xlink:href={{model.render.img}}></image></g>"
  );


  $templateCache.put('app/components/game/model/over_models_list.html',
    "<g ng-repeat=\"(i,model) in state.game.models[type] track by model.state.stamp\"><g ng-attr-transform={{model.render.transform}} ng-class=\"{\n" +
    "               'remote-selection': model.selection.remote,\n" +
    "               'local-selection': model.selection.local,\n" +
    "               'single-remote': model.selection.single_remote,\n" +
    "               'single-local': model.selection.single_local\n" +
    "               }\"><circle class=model-edge ng-attr-cx={{model.render.cx}} ng-attr-cy={{model.render.cy}} ng-attr-r={{model.render.radius}}></circle><image class=model-image ng-show=model.render.lock.show ng-attr-x={{model.render.lock.x}} ng-attr-y={{model.render.lock.y}} width=10 height=10 xlink:href=/data/icons/Lock.png></image><line class=model-los-selection ng-attr-x1={{model.render.cx}} ng-attr-y1={{model.render.cy}} ng-attr-x2={{model.render.cx}} ng-attr-y2={{model.render.los.dy}}></line><line class=model-los-selection ng-attr-x1={{model.render.los.lx}} ng-attr-y1={{model.render.cy}} ng-attr-x2={{model.render.los.rx}} ng-attr-y2={{model.render.cy}}></line><image class=model-image ng-repeat=\"e in ['b','c','d','e','f','k','l','t']\" ng-show=model.render.effects[e].show ng-attr-x={{model.render.effects[e].x}} ng-attr-y={{model.render.effects[e].y}} width=10 height=10 xlink:href={{model.render.effects[e].link}}></image><g ng-if=model.render.dmg.show><line class=model-damage-bar style=\"stroke: #F00\" ng-attr-x1={{model.render.dmg.lx}} ng-attr-y1={{model.render.dmg.ly}} ng-attr-x2={{model.render.dmg.rx}} ng-attr-y2={{model.render.dmg.ry}}></line><line class=model-damage-bar style=\"stroke: #0F0\" ng-attr-x1={{model.render.dmg.x}} ng-attr-y1={{model.render.dmg.ly}} ng-attr-x2={{model.render.dmg.rx}} ng-attr-y2={{model.render.dmg.ry}}></line></g><g ng-if=model.render.field.show><line class=model-damage-bar style=\"stroke: #066\" ng-attr-x1={{model.render.field.lx}} ng-attr-y1={{model.render.field.ly}} ng-attr-x2={{model.render.field.rx}} ng-attr-y2={{model.render.field.ry}}></line><line class=model-damage-bar style=\"stroke: #0FF\" ng-attr-x1={{model.render.field.x}} ng-attr-y1={{model.render.field.ly}} ng-attr-x2={{model.render.field.rx}} ng-attr-y2={{model.render.field.ry}}></line></g><g click-game-element-label=model.render.counter></g><image class=model-image ng-show=model.render.souls.show ng-attr-x={{model.render.souls.cx}} ng-attr-y={{model.render.souls.cy}} width=20 height=20 ng-attr-transform={{model.render.souls.transform}} xlink:href=/data/icons/Soul.png></image><g click-game-element-label=model.render.souls></g><g click-game-element-label=model.render.unit></g></g><g click-game-element-label=model.render.label ng-attr-transform={{model.render.label_transform}}></g><g click-game-element-label=model.render.path.length></g><circle class=model-charge-target ng-show=model.render.charge_target.show ng-class=\"{ reached: model.render.charge_target.reached }\" ng-attr-cx={{model.render.charge_target.cx}} ng-attr-cy={{model.render.charge_target.cy}} ng-attr-r={{model.render.charge_target.radius}}></circle></g>"
  );


  $templateCache.put('app/components/game/model/under_models_list.html',
    "<g ng-repeat=\"(i,model) in state.game.models[type] track by model.state.stamp\"><rect class=model-charge-path ng-show=model.render.path.show ng-attr-x={{model.render.path.x}} ng-attr-y={{model.render.path.y}} ng-attr-width={{2*model.render.radius}} height=800 ng-attr-transform={{model.render.path.transform}}></rect><g ng-attr-transform={{model.render.transform}} ng-class=\"{\n" +
    "               'remote-selection': model.selection.remote,\n" +
    "               'local-selection': model.selection.local,\n" +
    "               'single-remote': model.selection.single_remote,\n" +
    "               'single-local': model.selection.single_local\n" +
    "               }\"><circle class=model-ctrl-area ng-if=model.render.ctrl ng-attr-cx={{model.render.cx}} ng-attr-cy={{model.render.cy}} ng-attr-r={{model.render.ctrl}}></circle><circle class=model-area ng-show=model.render.area ng-attr-cx={{model.render.cx}} ng-attr-cy={{model.render.cy}} ng-attr-r={{model.render.area}}></circle><circle class=color-aura style=\"filter: url(#aura-filter)\" ng-show=model.render.aura.show ng-style=\"{ fill: model.render.aura.color }\" ng-attr-cx={{model.render.cx}} ng-attr-cy={{model.render.cy}} ng-attr-r={{model.render.aura.radius}}></circle><circle class=state-aura style=\"filter: url(#aura-filter)\" ng-attr-cx={{model.render.cx}} ng-attr-cy={{model.render.cy}} ng-attr-r={{model.render.aura.radius}}></circle><path class=model-melee ng-show=model.render.melee.strike.show ng-attr-d={{model.render.melee.strike.path}}></path><path class=model-melee ng-show=model.render.melee.reach.show ng-attr-d={{model.render.melee.reach.path}}></path><path class=model-melee ng-show=model.render.melee.melee.show ng-attr-d={{model.render.melee.melee.path}}></path></g></g>"
  );


  $templateCache.put('app/components/game/ruler/ruler.html',
    "<g><line style=\"marker-start: url(#ruler-start);\n" +
    "               marker-end: url(#ruler-end)\" ng-show=render.local.show ng-attr-x1={{render.local.x1}} ng-attr-y1={{render.local.y1}} ng-attr-x2={{render.local.x2}} ng-attr-y2={{render.local.y2}}></line><line style=\"marker-start: url(#ruler-start);\n" +
    "               marker-end: url(#ruler-end)\" ng-show=render.remote.show ng-attr-x1={{render.remote.x1}} ng-attr-y1={{render.remote.y1}} ng-attr-x2={{render.remote.x2}} ng-attr-y2={{render.remote.y2}}></line><circle class=ruler-origin ng-if=render.origin ng-attr-cx={{render.origin.cx}} ng-attr-cy={{render.origin.cy}} ng-attr-r={{render.origin.radius}}></circle><circle class=ruler-target ng-if=render.target ng-class=\"{ reached: render.target.reached }\" ng-attr-cx={{render.target.cx}} ng-attr-cy={{render.target.cy}} ng-attr-r={{render.target.radius}}></circle><g click-game-element-label=render.label></g></g>"
  );


  $templateCache.put('app/components/game/scenario/scenario.html',
    "<g><circle ng-repeat=\"(i,c) in state.game.scenario.circle\" ng-attr-cx={{::c.x}} ng-attr-cy={{::c.y}} ng-attr-r={{::c.r}} class=zone></circle><rect ng-repeat=\"(i,r) in state.game.scenario.rect\" ng-attr-x={{::r.x-r.width/2}} ng-attr-y={{::r.y-r.height/2}} ng-attr-width={{::r.width}} ng-attr-height={{::r.height}} class=zone></rect><circle ng-repeat=\"(i,o) in state.game.scenario.objectives\" ng-attr-cx={{::o.x}} ng-attr-cy={{::o.y}} r=9.842 class=objective></circle><circle ng-repeat=\"(i,f) in state.game.scenario.flags\" ng-attr-cx={{::f.x}} ng-attr-cy={{::f.y}} r=7.874 class=objective></circle><g ng-show=\"stateIs('game.setup')\"><rect ng-show=state.game.scenario.killbox x=140 y=140 width=200 height=200 class=area></rect><circle ng-repeat=\"(i,o) in state.game.scenario.objectives\" ng-attr-cx={{::o.x}} ng-attr-cy={{::o.y}} r=49.842 class=area></circle><circle ng-repeat=\"(i,f) in state.game.scenario.flags\" ng-attr-cx={{::f.x}} ng-attr-cy={{::f.y}} r=47.874 class=area></circle></g></g>"
  );


  $templateCache.put('app/components/game/selection_osd/selection_osd.html',
    "<div ng-include=\"'app/components/game/selection_osd/selection_osd_'+selection.type+'.html'\"></div>"
  );


  $templateCache.put('app/components/game/selection_osd/selection_osd_model.html',
    "<div class=\"panel panel-info\"><div class=panel-heading ng-click=selection.doClose()><button class=close><span>&times;</span></button><h4 class=panel-title>{{selection.info.name}}</h4></div><div class=panel-content><div ng-if=selection.info.unit_name><strong>Unit :</strong> {{selection.info.unit_name}}</div><div><strong>Name :</strong> {{selection.info.name}}</div><div><strong>Created By :</strong> {{selection.element.user}}</div><div><strong>Class :</strong> {{selection.info.type}} - {{selection.info.base}}</div><div ng-show=selection.info.fury><strong>Fury :</strong> {{selection.info.fury}}</div><div ng-show=selection.info.focus><strong>Focus :</strong> {{selection.info.focus}}</div><div class=\"hint clickable\" ng-hide=selection.show.info ng-click=\"selection.show.info = true\">Show Info...</div><div class=bg-info ng-show=selection.show.info><div ng-repeat=\"d in selection.info.desc\"><strong>{{d[0]}}</strong> {{d[1]}}</div></div><form ng-submit=selection.doAddLabel()><div class=form-group><label for=new-label>Label</label><input id=new-label class=form-control ng-model=selection.edit.label placeholder=\"New Label\"></div><button type=button class=\"btn btn-default\" ng-repeat=\"l in selection.element.l\" ng-click=selection.doRemoveLabel(l)>{{::selection.labelDisplay(l)}} <span>&times;</span></button></form><div><strong>Damage :</strong><click-game-model-damage info=selection.info.damage state=selection.element></click-game-model-damage></div></div></div>"
  );


  $templateCache.put('app/components/game/selection_osd/selection_osd_null.html',
    "<div></div>"
  );


  $templateCache.put('app/components/game/selection_osd/selection_osd_template.html',
    "<div class=\"panel panel-info\"><div class=panel-heading><h4 class=panel-title>{{selection.element.type}} Template</h4></div><div class=panel-content><form name=selection-label ng-submit=selection.doSetMaxDeviation() ng-show=\"selection.element.type === 'aoe'\"><div class=form-group><label for=new-deviation>Max Deviation</label><input id=new-deviation class=form-control type=number step=any min=0 ng-model=selection.edit.max_deviation placeholder=\"0\"></div></form><form ng-submit=selection.doAddLabel()><div class=form-group><label for=new-label>Label</label><input id=new-label class=form-control ng-model=selection.edit.label placeholder=\"New Label\"></div><button type=button class=\"btn btn-default\" ng-repeat=\"l in selection.element.l\" ng-click=selection.doRemoveLabel(l)>{{::selection.labelDisplay(l)}} <span>&times;</span></button></form></div></div>"
  );


  $templateCache.put('app/components/game/template/templates_list.html',
    "<g ng-repeat=\"template in state.game.templates[type] track by template.state.stamp\" click-game-template ng-class=\"{\n" +
    "             'selection': selection.selected,\n" +
    "             'local': selection.local,\n" +
    "             'remote': selection.remote\n" +
    "             }\"><circle ng-show=\"template.render.type==='aoe'\" class=\"template aoe\" data-stamp={{template.render.stamp}} ng-attr-cx={{template.render.x}} ng-attr-cy={{template.render.y}} ng-attr-r={{template.render.radius}}></circle><line ng-show=\"template.render.type==='aoe'\" class=template-aoe-direction style=\"marker-end: url(#aoe-direction-end)\" ng-attr-x1={{template.render.x}} ng-attr-y1={{template.render.y}} ng-attr-x2={{template.render.dx}} ng-attr-y2={{template.render.dy}} ng-attr-transform={{template.render.dtransform}}></line><polygon ng-show=\"template.render.type==='spray'\" class=\"template spray\" data-stamp={{template.render.stamp}} ng-attr-points={{template.render.points}} ng-attr-transform={{template.render.transform}}></polygon><rect ng-show=\"template.render.type==='wall'\" class=\"template wall\" data-stamp={{template.render.stamp}} ng-attr-x={{template.render.x}} ng-attr-y={{template.render.y}} width=40 height=7.5 ng-attr-transform={{template.render.transform}}></rect><g click-game-element-label=template.render.label></g><circle class=spray-origin ng-if=template.render.origin ng-attr-cx={{template.render.origin.cx}} ng-attr-cy={{template.render.origin.cy}} ng-attr-r={{template.render.origin.radius}}></circle></g>"
  );


  $templateCache.put('app/components/game/terrain/terrains_list.html',
    "<g ng-repeat=\"(i,terrain) in state.game.terrains[type] track by terrain.state.stamp\" click-game-terrain ng-attr-transform={{terrain.render.transform}} ng-class=\"{\n" +
    "             'local-selection': selection.local,\n" +
    "             'remote-selection': selection.remote\n" +
    "             }\"><image class=terrain-image data-stamp={{::terrain.render.stamp}} x=0 y=0 xlink:href=\"\" ng-attr-xlink:href={{::terrain.render.img_link}} ng-attr-width={{::terrain.render.width}} ng-attr-height={{::terrain.render.height}}></image><rect class=terrain-edge x=0 y=0 ng-attr-width={{::terrain.render.width}} ng-attr-height={{::terrain.render.height}}></rect></g>"
  );


  $templateCache.put('app/components/game/tool_box/game_tool_box.html',
    "<div class=panel-content><div class=btn-group><button class=btn ng-class=\"{\n" +
    "                      'btn-primary': game.currentModeIs('Ruler'),\n" +
    "                      'btn-default': !game.currentModeIs('Ruler')\n" +
    "                      }\" title=\"{{game.action_bindings['enterRulerMode'] || ''}}\" ng-click=tool_box.doUseRuler()>Use<br>Ruler</button> <button class=btn ng-class=\"{\n" +
    "                      'btn-primary': (state.game.ruler | gameRuler:'isDisplayed'),\n" +
    "                      'btn-default': !(state.game.ruler | gameRuler:'isDisplayed')\n" +
    "                      }\" ng-click=tool_box.doToggleShowRuler()>Show<br>Ruler</button></div><div class=btn-group><button class=\"btn {{ game.currentModeIs('Los') ? 'btn-primary' : 'btn-default' }}\" title=\"{{game.action_bindings['enterLosMode'] || ''}}\" ng-click=tool_box.doUseLos()>Use<br>LoS</button> <button class=\"btn {{ (state.game.los | gameLos:'isDisplayed') ? 'btn-primary' : 'btn-default' }}\" ng-click=tool_box.doToggleShowLos()>Show<br>LoS</button></div><div class=btn-group><button class=\"btn btn-default\" ng-click=\"tool_box.doCreateTemplate('aoe')\">New<br>AoE</button> <button class=\"btn btn-default\" ng-click=\"tool_box.doCreateTemplate('spray')\">New<br>Spray</button> <button class=\"btn btn-default\" ng-click=\"tool_box.doCreateTemplate('wall')\">New<br>Wall</button></div></div>"
  );


  $templateCache.put('app/components/game/zoom_osd/zoom_osd.html',
    "<button type=button class=\"btn btn-default\" ng-click=\"game.doModeAction('viewZoomIn')\" title=\"{{game.action_bindings['viewZoomIn'] || ''}}\"><span class=\"glyphicon glyphicon-zoom-in\"></span></button> <button type=button class=\"btn btn-default\" ng-click=\"game.doModeAction('viewZoomReset')\" title=\"{{game.action_bindings['viewZoomReset'] || ''}}\"><span class=\"glyphicon glyphicon-fullscreen\"></span></button> <button type=button class=\"btn btn-default\" ng-click=\"game.doModeAction('viewZoomOut')\" title=\"{{game.action_bindings['viewZoomOut'] || ''}}\"><span class=\"glyphicon glyphicon-zoom-out\"></span></button>"
  );


  $templateCache.put('app/components/games_list/games_list.html',
    "<div ng-repeat=\"(i,g) in vm.games\" class=\"clickable {{ ( (vm.current && g.public_stamp === vm.current) ? 'bg-primary' : (vm.isInSelection(i) ? 'bg-info' : '' ) ) }}\" ng-click=vm.doSetSelection(i)>{{::g | game:'description'}}</div>"
  );


  $templateCache.put('app/components/mail_notification/mail_notification.html',
    "<audio src=/data/sound/you_got_mail.wav></audio>"
  );


  $templateCache.put('app/components/prompt/prompt.html',
    "<div><div class=prompt-mask></div><div class=\"prompt-container text-center\"><div class=\"prompt-panel panel panel-default\"><form name=prompt><div class=panel-body><p></p><input step=any min=0 class=\"form-control\"></div><div class=panel-footer><button class=\"btn btn-default\" type=button style=width:45%>Cancel</button> <button class=\"btn btn-primary\" type=submit style=width:45%>Ok</button></div></form></div></div></div>"
  );


  $templateCache.put('app/components/user_chat/user_chat.html',
    "<div ng-repeat=\"u in user_chat.user.connection.users track by u.stamp\" class=\"user clickable {{ user_chat.userIsInRecipients(u.stamp) ? 'bg-info' : '' }} {{ (user_chat.user.state.stamp === u.stamp) ? 'bg-primary' : '' }}\" ng-click=user_chat.doToggleRecipient(u.stamp)>{{ u | user:'stateDescription' }}</div><h4>Chat</h4><form ng-submit=user_chat.doSendChatMsg()><div class=form-group><label>To :</label><em>{{ (user_chat.user | userConnection:'usersNamesForStamps':user_chat.chat.to) .join(',') }}</em><div class=input-group><span class=input-group-btn><button type=button class=\"btn btn-default\" ng-click=user_chat.doBroadcastChatMsg()>ToAll</button></span> <input class=form-control placeholder=Msg... ng-model=\"user_chat.chat.msg\"></div></div></form><div class=chat-list><div class=chat ng-repeat=\"c in user_chat.user.connection.chat.slice().reverse() track by c.stamp\"><em ng-click=user_chat.doSetRecipientsFromChat(c) class=clickable>{{ state.user | userConnection:'userNameForStamp':c.from }} ➝ {{ (state.user | userConnection:'usersNamesForStamps':c.to).join(',') }}</em> : <a ng-href={{c.link}}>{{c.msg}}</a></div></div>"
  );


  $templateCache.put('app/views/debug/debug.html',
    "<div class=container><div class=\"panel panel-info\"><div class=panel-heading><h4 class=panel-title>Import dump file</h4></div><div class=panel-body><p class=text-warning>{{debug.result}}</p><form><input class=form-control id=import-file type=file multiple click-file=\"debug.doLoadDumpFile(file)\"></form></div></div></div>"
  );


  $templateCache.put('app/views/game/game.html',
    "<div id=game click-game-page><div id=gameview class=resizable><div id=zoom-osd class=btn-group-vertical ng-include=\"'app/components/game/zoom_osd/zoom_osd.html'\"></div><div id=cmd-osd ng-include=\"'app/components/game/cmd_osd/cmd_osd.html'\"></div><div id=game-loading class=\"text-center bg-primary\" click-game-loading><strong>Loading...</strong></div><div id=selection-osd ng-include=\"'app/components/game/selection_osd/selection_osd.html'\" click-game-selection-detail></div><div id=tool-osd><click-game-tool-box></click-game-tool-box><click-game-dice-box></click-game-dice-box></div><div id=chat-osd><click-game-chat-box></click-game-chat-box></div><div class=edit-label click-game-edit-label></div><div class=edit-damage click-game-edit-damage></div><div id=viewport><svg id=map click-game-map viewbox=\"0 0 480 480\"><defs><filter id=aura-filter x=-50% y=-50% width=200% height=200%><fegaussianblur in=SourceGraphic stddeviation=\"2\"></filter><filter id=state-aura-filter x=-75% y=-75% width=250% height=250%><fegaussianblur in=SourceGraphic stddeviation=\"4\"></filter><marker id=aoe-direction-end markerwidth=6 markerheight=8 refx=6 refy=4 orient=auto><polygon points=\"0,8 6,4 0,0\" style=\"fill:#0F0\"></marker><marker id=ruler-start markerwidth=6 markerheight=8 refx=0 refy=4 orient=auto><polygon points=\"6,8 0,4 6,0\" style=\"fill:#0EE\"><line x1=0 y1=1 x2=0 y2=7 style=\"stroke:#0CC;\n" +
    "                         stroke-width:2px\"></marker><marker id=ruler-end markerwidth=6 markerheight=8 refx=6 refy=4 orient=auto><polygon points=\"0,8 6,4 0,0\" style=\"fill:#0EE\"><line x1=6 y1=1 x2=6 y2=7 style=\"stroke:#0CC;\n" +
    "                         stroke-width:2px\"></marker><clippath id=los-clip><polygon></polygon></clippath></defs><g id=game-board ng-show=\"state.game.layers | gameLayers:'isDisplayed':'b'\"><image id=board-preview x=0 y=0 width=480 height=480 xlink:href=\"{{state.game.board.preview || ''}}\"></image><image id=board-view x=0 y=0 width=480 height=480 xlink:href=\"{{state.game.board.img || ''}}\"></image></g><g id=game-terrains-locked ng-show=\"state.game.layers | gameLayers:'isDisplayed':'b'\" click-game-terrains-list=locked></g><g id=game-terrains ng-show=\"state.game.layers | gameLayers:'isDisplayed':'b'\" click-game-terrains-list=active></g><g id=game-deploiement ng-show=\"state.game.layers | gameLayers:'isDisplayed':'d'\" ng-include=\"'app/components/game/deploiement/deploiement.html'\"></g><g id=game-scenario ng-show=\"state.game.layers | gameLayers:'isDisplayed':'s'\" ng-include=\"'app/components/game/scenario/scenario.html'\"></g><g id=game-templates-locked ng-show=\"state.game.layers | gameLayers:'isDisplayed':'t'\" click-game-templates-list=locked></g><g id=game-under-models ng-show=\"state.game.layers | gameLayers:'isDisplayed':'m'\"><g click-game-under-models-list=locked></g><g click-game-under-models-list=active></g><g click-game-los-enveloppe></g></g><g id=game-models-locked ng-show=\"state.game.layers | gameLayers:'isDisplayed':'m'\" click-game-models-list=locked></g><g id=game-models ng-show=\"state.game.layers | gameLayers:'isDisplayed':'m'\" click-game-models-list=active></g><g id=game-over-models ng-show=\"state.game.layers | gameLayers:'isDisplayed':'m'\"><g click-game-over-models-list=locked></g><g click-game-over-models-list=active></g></g><g id=game-templates ng-show=\"state.game.layers | gameLayers:'isDisplayed':'t'\" click-game-templates-list=active></g><g id=game-ruler click-game-ruler></g><g id=game-los click-game-los></g><g id=game-create-terrains><g ng-repeat=\"(index, terrain) in state.create.terrains\" click-game-create-terrain></g></g><g id=game-create-models><g ng-repeat=\"(index, model) in state.create.models\" click-game-create-model><circle class=create-model ng-attr-cx={{pos.x}} ng-attr-cy={{pos.y}} ng-attr-r={{pos.radius}}></circle></g></g><g id=game-create-templates><g ng-repeat=\"(index, template) in state.create.templates\" click-game-create-template></g></g><rect id=game-dragbox click-game-dragbox ng-attr-x={{render.x}} ng-attr-y={{render.y}} ng-attr-width={{render.width}} ng-attr-height={{render.height}}></rect></svg></div></div><div id=menu><button id=menu-toggle class=\"btn btn-default\" title=\"Toggle menu\"><span class=\"glyphicon glyphicon-chevron-left\"></span> <span class=\"glyphicon glyphicon-chevron-right\"></span></button><div id=menu-content><p><strong>{{state.game | game:'description'}}</strong><form class=form-inline ng-show=\"state.game | gameConnection:'active'\" ng-submit=game.doInvitePlayer()><div class=form-group><div class=input-group><span class=input-group-btn><button type=submit class=\"btn btn-default\">Invite Player</button></span><select class=form-control ng-options=\"u.stamp as (u.name | capitalize)\n" +
    "                                  for u in state.user.connection.users\" ng-model=game.invite_player required></select></div></div></form></p><ul class=\"nav nav-tabs\"><li class=\"{{app.stateIs('game.main') ? 'active' : ''}}\" ng-click=\"app.goToState('^.main')\"><a click-chat-hint=game hint-state=game.main>Main</a></li><li class=\"{{app.stateIs('game.model') ? 'active' : ''}}\" ng-click=\"app.goToState('^.model')\"><a>Model</a></li><li class=\"{{app.stateIs('game.setup') ? 'active' : ''}}\" ng-click=\"app.goToState('^.setup')\"><a>Setup</a></li><li class=\"{{app.stateIs('game.log') ? 'active' : ''}}\" ng-click=\"app.goToState('^.log')\"><a>Log</a></li><li class=\"{{app.stateIs('game.save') ? 'active' : ''}}\" ng-click=\"app.goToState('^.save')\"><a>Save</a></li><li class=\"{{app.stateIs('game.help') ? 'active' : ''}}\" ng-click=\"app.goToState('^.help')\"><a>Help</a></li><li ng-show=\"state.user | user:'isOnline'\" class=\"{{app.stateIs('game.online') ? 'active' : ''}}\" ng-click=\"app.goToState('^.online')\"><a click-chat-hint=user hint-state=game.online>Online</a></li><li ng-click=\"app.goToState('lounge')\"><a>Lounge</a></li></ul><div ui-view id=menu-view class=\"{{game.menuDisabled() ? 'disabled' : ''}}\"></div></div></div><click-mail-notification type=game></click-mail-notification><click-bad-dice-notification></click-bad-dice-notification></div>"
  );


  $templateCache.put('app/views/game/help/game_help.html',
    "<div><div class=\"panel panel-info\"><div class=panel-heading>Current Mode Bindings</div><table class=table><tr ng-repeat=\"bind in game_help.bindings_pairs track by bind[0]\"><td><button class=\"btn btn-default\" ng-click=game.doModeAction(bind[0])>{{::bind[0]}}</button></td><td>{{::bind[1]}}</td><td></td></tr></table></div></div>"
  );


  $templateCache.put('app/views/game/log/game_log.html',
    "<div><div class=\"panel panel-info\"><div class=panel-heading><strong>Command Log</strong></div><div class=panel-content><button class=\"btn btn-default\" title=\"{{game.action_bindings['commandUndoLast'] || ''}}\" ng-disabled=\"state.game.commands.length === 0\" ng-click=\"game.doModeAction('commandUndoLast')\">Undo Last</button> <button class=\"btn btn-default\" title=\"{{game.action_bindings['commandReplayNext'] || ''}}\" ng-disabled=\"state.game.undo.length === 0\" ng-click=\"game.doModeAction('commandReplayNext')\">Replay Next</button><div class=log-replay-list click-log-replay-list=undo><div ng-repeat=\"(i,cmd)\n" +
    "                        in state.game.undo.slice(-20)\n" +
    "                        track by cmd.stamp\"><span class=text-primary>[{{::cmd.user}}]</span> {{::cmd.type}} {{::cmd.desc}}</div></div><div class=\"log-replay-list log\" click-log-replay-list=undo_log><div ng-repeat=\"(i,cmd)\n" +
    "                        in state.game.undo_log.slice(-20)\n" +
    "                        track by cmd.stamp\"><span class=text-primary>[{{::cmd.user}}]</span> <span class=text-info>{{::cmd.type}} {{::cmd.desc}}</span></div></div><div class=\"log-command-list log\"><div ng-repeat=\"(i,cmd)\n" +
    "                        in state.game.commands_log.slice(-20).reverse()\n" +
    "                        track by cmd.stamp\"><span class=text-primary>[{{::cmd.user}}]</span> <span class=text-info>{{::cmd.type}} {{::cmd.desc}}</span></div></div><div class=log-command-list><div ng-repeat=\"(i,cmd)\n" +
    "                        in state.game.commands.slice(-20).reverse()\n" +
    "                        track by cmd.stamp\"><span class=text-primary>[{{::cmd.user}}]</span> {{::cmd.type}} {{::cmd.desc}}</div></div></div></div></div>"
  );


  $templateCache.put('app/views/game/main/game_main.html',
    "<div><div ng-show=\"state.game | gameConnection:'active'\" class=\"panel panel-info\"><div class=panel-heading>Chat</div><div class=panel-content><click-game-chat-box></click-game-chat-box></div></div><div class=\"panel panel-info\"><div class=panel-heading>Tools</div><click-game-tool-box></click-game-tool-box></div><div class=\"panel panel-info\"><div class=panel-heading>Dice</div><div class=panel-content><click-game-dice-box></click-game-dice-box></div></div></div>"
  );


  $templateCache.put('app/views/game/model/game_model.html',
    "<div><div class=\"panel panel-info\"><div class=panel-heading><strong>Create Model</strong></div><div class=panel-content><form class=form-inline name=create-model><table><tr><th>Faction</th><td><select class=form-control ng-options=\"k as f.name for (k,f) in state.factions.current\" ng-model=game_model.faction ng-change=game_model.onFactionChange()></select></td></tr><tr><th>Section</th><td><select class=form-control ng-options=\"k as k for (k,s) in\n" +
    "                                  state.factions.current[game_model.faction].models\" ng-model=game_model.section ng-change=game_model.onSectionChange()></select></td></tr><tr><th>Entry</th><td><select class=form-control ng-options=\"k as e.name for (k,e) in\n" +
    "                                  state.factions.current[game_model.faction].models[game_model.section]\" ng-model=game_model.entry ng-change=game_model.onEntryChange()></select></td></tr><tr ng-show=state.factions.current[game_model.faction].models[game_model.section][game_model.entry].entries><th>Type</th><td><select class=form-control ng-options=\"k as k for (k,t) in\n" +
    "                                  state.factions.current[game_model.faction].models[game_model.section][game_model.entry].entries\n" +
    "                                  \" ng-model=game_model.type ng-change=game_model.onTypeChange()></select></td></tr><tr ng-show=state.factions.current[game_model.faction].models[game_model.section][game_model.entry].entries><th>Model</th><td><select class=form-control ng-options=\"\n" +
    "                                  k as m.name for (k,m) in\n" +
    "                                  state.factions.current[game_model.faction].models[game_model.section][game_model.entry].entries[game_model.type]\n" +
    "                                  \" ng-model=game_model.model ng-change=game_model.onModelChange()></select></td></tr><tr ng-show=game_model.getModel().ranges><th>Size</th><td><select class=form-control ng-options=\"\n" +
    "                                  s as s for (k,s) in\n" +
    "                                  game_model.getModel().ranges\n" +
    "                                  \" ng-model=game_model.repeat></select></td></tr></table></form><br><table ng-show=game_model.getModel()><tr ng-show=\"game_model.getModel() !==\n" +
    "                     state.factions.current[game_model.faction].models[game_model.section][game_model.entry]\"><th>Unit</th><td>{{state.factions.current[game_model.faction].models[game_model.section][game_model.entry].name}}</td></tr><tr><th>Name</th><td>{{game_model.getModel().name}}</td></tr><tr><th>Type</th><td>{{game_model.getModel().type}}</td></tr><tr ng-show=game_model.getModel().fury><th>Fury</th><td>{{game_model.getModel().fury}}</td></tr><tr><th>Base</th><td>{{game_model.getModel().base}}</td></tr><tr><th>Damage</th><td><click-game-model-damage info=game_model.getModel().damage></click-game-model-damage></td></tr><tr ng-show=game_model.getModel().img[0].link><th>Image</th><td><img width=150 height=150 ng-src=\"{{game_model.getModel().img[0].link}}\"></td></tr></table></div><div class=panel-footer><button class=\"btn btn-default\" ng-disabled=\"!game_model.getModel() ||\n" +
    "                           game.currentModeIs('CreateModel')\n" +
    "                           \" ng-click=game_model.doCreateModel()>Create Model</button></div></div><div class=\"panel panel-info\"><form name=import-list ng-submit=game_model.doImportList()><div class=panel-heading><strong>Import List</strong></div><div class=panel-content><textarea class=form-control style=\"width:100%;\n" +
    "                         height: 8em\" ng-model=game_model.import_list placeholder=\"Forward Kommander list...\">\n" +
    "        </textarea></div><div class=panel-footer><button class=\"btn btn-default\" type=submit>Import List</button></div></form></div><div class=\"panel panel-info\"><div class=panel-heading><strong>Import Models File</strong></div><div class=panel-content><form class=form-inline><div class=form-group><input type=file multiple class=form-control click-file=\"game_model.doImportModelsFile(file)\"></div></form></div></div></div>"
  );


  $templateCache.put('app/views/game/online/game_online.html',
    "<div><div class=\"panel panel-info\"><div class=panel-heading><h4 class=panel-title>{{ state.user | user:'description' }} / {{ (state.user | user:'isOnline') ? 'Online' : 'Offline' }}</h4></div><div class=panel-body ng-show=\"state.user | user:'isOnline'\"><click-user-chat></click-user-chat></div></div><div class=\"panel panel-info\" ng-show=\"state.user | userConnection:'active'\"><div class=panel-heading><h4 class=panel-title>Online Games</h4></div><div class=\"game-list panel-body\"><click-games-list games=state.user.connection.games selection=game_online.games_selection current=state.game.public_stamp></click-games-list></div><div class=panel-footer><form><div class=btn-group><button type=button class=\"btn btn-default\" ng-click=game_online.doLoadOnlineGame() ng-disabled=\"game_online.games_selection.list.length <= 0\">Watch Game</button></div></form></div></div></div>"
  );


  $templateCache.put('app/views/game/save/game_save.html',
    "<div><div class=\"panel panel-info\"><div class=panel-heading>Save current game</div><div class=panel-body><a class=\"btn btn-default\" ng-disabled=!game_save.game_export.url ng-href={{game_save.game_export.url}} download={{game_save.game_export.name}}>Download Game File</a></div></div><div class=\"panel panel-info\"><div class=panel-heading>Save current models selection</div><div class=panel-body><a class=\"btn btn-default\" ng-disabled=!game_save.models_export.url ng-href={{game_save.models_export.url}} download={{game_save.models_export.name}}>Download Models File</a></div></div><div class=\"panel panel-info\"><div class=panel-heading>Save current board and terrain</div><div class=panel-body><a class=\"btn btn-default\" ng-disabled=!game_save.board_export.url ng-href={{game_save.board_export.url}} download={{game_save.board_export.name}}>Download Board File</a></div></div></div>"
  );


  $templateCache.put('app/views/game/setup/game_setup.html',
    "<div><div class=\"panel panel-info\"><div class=panel-heading><strong>Layers</strong></div><div class=panel-content><form class=form-inline name=layers><div class=checkbox><label><input type=checkbox ng-checked=\"game_setup.layers | gameLayers:'isDisplayed':'b'\" ng-click=\"game_setup.doToggleLayer('b')\"> Board</label></div><div class=checkbox><label><input type=checkbox ng-checked=\"game_setup.layers | gameLayers:'isDisplayed':'d'\" ng-click=\"game_setup.doToggleLayer('d')\"> Deploiement</label></div><div class=checkbox><label><input type=checkbox ng-checked=\"game_setup.layers | gameLayers:'isDisplayed':'s'\" ng-click=\"game_setup.doToggleLayer('s')\"> Scenario</label></div><div class=checkbox><label><input type=checkbox ng-checked=\"game_setup.layers | gameLayers:'isDisplayed':'m'\" ng-click=\"game_setup.doToggleLayer('m')\"> Models</label></div><div class=checkbox><label><input type=checkbox ng-checked=\"game_setup.layers | gameLayers:'isDisplayed':'t'\" ng-click=\"game_setup.doToggleLayer('t')\"> Templates</label></div></form></div></div><div class=\"panel panel-info\"><div class=panel-heading><strong>Scenario</strong></div><div class=panel-content><form class=form-inline name=scenario><select class=form-control ng-options=\"s as s[0] for s in state.scenarios\" ng-model=game_setup.scenario_group></select><select class=form-control ng-options=\"s.name as s.name for s in game_setup.scenario_group[1]\" ng-model=game_setup.scenario_name ng-change=game_setup.doSetScenario()></select><button class=\"btn btn-default\" ng-click=game_setup.doSetRandomScenario()>Random</button> <button class=\"btn btn-default\" ng-click=game_setup.doGenerateObjectives()>Generate Objective</button></form></div></div><div class=\"panel panel-info\"><div class=panel-heading><strong>Import Board File</strong></div><div class=panel-content><form class=form-inline><div class=form-group><input type=file multiple class=form-control click-file=\"game_setup.doImportBoardFile(file)\"></div></form></div></div><div class=\"panel panel-info\"><div class=panel-heading><strong>Board Map</strong></div><div class=panel-content><form class=form-inline name=board-map><select class=form-control ng-options=\"b.name as b.name for b in state.boards\" ng-model=game_setup.board_name ng-change=game_setup.doSetBoard()></select><button class=\"btn btn-default\" ng-click=game_setup.doSetRandomBoard()>Random</button> <button class=\"btn btn-default\" ng-click=game_setup.doResetTerrain()>Reset Terrain</button></form></div></div><div class=\"panel panel-info\"><div class=panel-heading><strong>Create Terrain</strong></div><div class=panel-content><form class=form-inline name=create-terrain><table><tr><th>Ambiance</th><td><select class=form-control ng-options=\"k as k for (k,f) in state.terrains\" ng-model=game_setup.ambiance ng-change=game_setup.onAmbianceChange()></select></td></tr><tr><th>Category</th><td><select class=form-control ng-options=\"k as k for (k,s) in\n" +
    "                                  state.terrains[game_setup.ambiance]\" ng-model=game_setup.category ng-change=game_setup.onCategoryChange()></select></td></tr><tr><th>Entry</th><td><select class=form-control ng-options=\"k as e.name for (k,e)\n" +
    "                                  in state.terrains[game_setup.ambiance][game_setup.category]\" ng-model=game_setup.entry ng-change=game_setup.onEntryChange()></select></td></tr></table></form><br><table><tr><th>Image</th><td><img ng-width={{game_setup.getTerrain().img.width/2}} ng-height={{game_setup.getTerrain().img.height/2}} ng-src=\"{{game_setup.getTerrain().img.link}}\"></td></tr></table></div><div class=panel-footer><button class=\"btn btn-default\" ng-disabled=\"!game_setup.getTerrain() ||\n" +
    "                           game.currentModeIs('CreateTerrain')\n" +
    "                           \" ng-click=game_setup.doCreateTerrain()>Create Terrain</button></div></div></div>"
  );


  $templateCache.put('app/views/info/info.html',
    "<div class=container><div class=\"panel panel-info\"><div class=panel-heading><h4 class=panel-title>Legal Info</h4></div><div class=panel-body><p>Privateer Press, WARMACHINE®, Cryx, Cygnar, Khador, Protectorate of Menoth, Retribution of Scyrah, HORDES, Circle Orboros, Legion of Everblight, Skorne, Trollbloods, and their logos and slogans; warjack, warbeast, and warcaster are trademark property of Privateer Press. ©2001-2014 Privateer Press, Inc. All Rights Reserved. Used without Permission.</p><p>This application is not official and not endorsed by Privateer Press.</p><p>Art assets are from the <a href=\"http://z7.invisionfree.com/vassalwmh/\">Vassal Warmachine module</a>, by Jeffery Brady and Ben Boyd.</p></div></div><div class=\"panel panel-info\"><div class=panel-heading><h4 class=panel-title>License and Source code</h4></div><div class=panel-body><p>This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.</p><p>This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.</p><p><a href=https://github.com/eauc/clicknfeat>The source code for this program is available here.</a></p></div></div></div>"
  );


  $templateCache.put('app/views/lounge/lounge.html',
    "<div id=lounge class=container><div class=\"panel panel-info\"><div class=panel-heading><h4 class=panel-title>{{ state.user | user:'description' }} / {{ (state.user | user:'isOnline') ? 'Online' : 'Offline' }}</h4></div><div class=panel-body ng-show=\"state.user | user:'isOnline'\"><click-user-chat></click-user-chat></div><div class=panel-footer><button type=button class=\"btn btn-default\" ng-click=lounge.doUserToggleOnline()>Go {{ (state.user | user:'isOnline') ? 'Offline' : 'Online' }}</button></div></div><div class=\"panel panel-info\" ng-show=\"state.user | userConnection:'active'\"><div class=panel-heading><h4 class=panel-title>Online Games</h4></div><div class=\"game-list panel-body\"><click-games-list games=state.user.connection.games selection=lounge.online_games_selection></click-games-list></div><div class=panel-footer><form><div class=btn-group><button type=button class=\"btn btn-default\" ng-click=lounge.doCreateOnlineGame()>New Game</button> <button type=button class=\"btn btn-default\" ng-click=lounge.doLoadOnlineGame() ng-disabled=\"lounge.online_games_selection.list.length <= 0\">Watch Game</button></div><div class=form-group><label for=import-file>Upload game file :</label><input class=form-control id=import-file type=file multiple click-file=\"lounge.doOpenOnlineGameFile(file)\"></div></form></div></div><div class=\"panel panel-info\"><div class=panel-heading><h4 class=panel-title>Local games</h4></div><div class=\"game-list panel-body\"><click-games-list games=state.local_games selection=lounge.local_games_selection></click-games-list></div><div class=panel-footer><form><div class=btn-group><button type=button class=\"btn btn-default\" ng-click=lounge.doCreateLocalGame()>New Game</button> <button type=button class=\"btn btn-default\" ng-click=lounge.doLoadLocalGame() ng-disabled=lounge.localGamesIsEmpty()>Load Game</button> <button type=button class=\"btn btn-default\" ng-click=lounge.doDeleteLocalGame(index) ng-disabled=lounge.localGamesIsEmpty()>Delete Game</button></div><div class=form-group><label for=import-file>Import game file :</label><input class=form-control id=import-file type=file click-file=\"lounge.doOpenLocalGameFile(file)\"></div></form></div></div></div>"
  );


  $templateCache.put('app/views/settings/bindings/settings_bindings.html',
    "<div id=settings-bindings><form><div class=form-group><label>For mode :</label><select class=form-control ng-options=\"m as m for m in settings_bindings.modes\" ng-model=settings_bindings.mode></select></div></form><table class=table><tr><th>Action</th><th>Default</th><th>Current</th></tr><tr ng-repeat=\"a in settings_bindings.getBindingsKeysForMode()\" class=\"{{ settings.edit.Bindings[settings_bindings.mode][a] && settings.edit.Bindings[settings_bindings.mode][a] !== state.settings.default.Bindings[settings_bindings.mode][a] ? 'modified' : '' }}\"><td class=vertical-center>{{::a}}</td><td class=vertical-center>{{::state.settings.default.Bindings[settings_bindings.mode][a]}}</td><td><div class=input-group><input class=form-control placeholder={{::state.settings.default.Bindings[settings_bindings.mode][a]}} ng-model=\"settings.edit.Bindings[settings_bindings.mode][a]\"> <span class=input-group-btn><button class=\"btn btn-default\" type=button ng-click=settings_bindings.doRecordBinding(a) ng-disabled=settings_bindings.recording><span class=\"glyphicon glyphicon-record\"></span></button></span></div><span class=hint ng-show=\"settings_bindings.recording === a\">Recording...</span></td></tr></table></div>"
  );


  $templateCache.put('app/views/settings/main/settings_main.html',
    "<div id=settings-main><div class=\"panel panel-info\"><div class=panel-heading><span class=\"glyphicon glyphicon-import\"></span> Import</div><div class=panel-content><form><input class=form-control id=import-file type=file click-file=\"settings_main.doLoadSettingsFile(file)\"></form><div class=error-list><strong class=text-warning>{{settings_main.load_settings_result}}</strong></div></div></div><div class=\"panel panel-info\"><div class=panel-heading><span class=\"glyphicon glyphicon-export\"></span> Export</div><div class=panel-content><a class=\"btn btn-default\" ng-disabled=!settings_main.export.url ng-href={{settings_main.export.url}} download={{::settings_main.export.name}}>Download Settings File</a></div></div><button type=button class=\"btn btn-default\" ng-click=settings_main.doResetSettings({})>Reset Settings</button></div>"
  );


  $templateCache.put('app/views/settings/misc/settings_misc.html',
    "<div id=settings-bindings><form><div class=form-group><label>For mode :</label><select class=form-control ng-options=\"m as m for m in settings_misc.modes\" ng-model=settings_misc.mode></select></div></form><table class=table><tr><th>Action</th><th>Default</th><th>Current</th></tr><tr ng-repeat=\"(a,b) in state.settings.default.Misc[settings_misc.mode]\" class=\"{{ settings.edit.Misc[settings_misc.mode][a] && settings.edit.Misc[settings_misc.mode][a] !== b ? 'modified' : '' }}\"><td class=vertical-center>{{::a}}</td><td class=vertical-center>{{::b}}</td><td><div class=input-group><input type=number class=form-control placeholder={{::b}} ng-model=\"settings.edit.Misc[settings_misc.mode][a]\"></div></td></tr></table></div>"
  );


  $templateCache.put('app/views/settings/models/settings_models.html',
    "<div id=settings-main><p class=text-warning><strong>{{result}}</strong></p><div class=\"panel panel-info\"><div class=panel-heading><span class=\"glyphicon glyphicon-import\"></span> Models Descriptions</div><div class=\"panel-body row\"><form><div class=\"form-group {{ settings_models.hasDesc(f) ? 'bg-info' : '' }}\" ng-repeat=\"(f, faction) in settings_models.factions\"><label class=\"control-label col-xs-3 text-right\"><span class=\"clickable glyphicon glyphicon-trash\" ng-click=settings_models.doClearFactionDesc(f)></span> {{::faction.name}}</label><input id=file-{{::f}} type=file multiple click-file=\"settings_models.doOpenFactionFile(f, file)\"></div></form></div><div class=panel-footer><button type=button class=\"btn btn-default\" ng-click=settings_models.doClearAllDesc(f)>Clear All <span class=\"glyphicon glyphicon-trash\"></span></button></div></div></div>"
  );


  $templateCache.put('app/views/settings/settings.html',
    "<div id=settings class=container><ul class=\"nav nav-tabs\"><li ng-repeat=\"m in settings.menu\" class=\"{{app.stateIs('settings.'+m) ? 'active' : ''}}\" ng-click=\"app.goToState('^.'+m)\"><a>{{::m}}</a></li></ul><div ui-view></div></div>"
  );


  $templateCache.put('app/views/user/user.html',
    "<div class=container><form name=user_form ng-submit=user.doSave()><div class=form-group><label for=name>Name</label><input id=name name=name class=form-control ng-model=user.edit.name required></div><div class=form-group><label for=language>Language</label><input id=language name=language class=form-control ng-model=user.edit.language placeholder=\"FR, EN, ...\"></div><div class=form-group><label for=chat>Chat</label><select id=chat name=chat class=form-control type=text ng-model=user.edit.chat multiple><option value=text>Text</option><option value=skype>Skype</option></select></div><div class=form-group><label for=faction>Faction</label><select id=faction name=faction class=form-control ng-model=user.edit.faction multiple><option value=circle>Circle Orboros</option><option value=cryx>Cryx</option><option value=cygnar>Cygnar</option><option value=cyriss>Convergence of Cyriss</option><option value=khador>Khador</option><option value=legion>Legion of Everblight</option><option value=menoth>Protectorate of Menoth</option><option value=mercs>Mercernaries</option><option value=minions>Minions</option><option value=scyrah>Retribution of Scyrah</option><option value=skorne>Skorne Empire</option><option value=troll>Trollbloods</option></select></div><div class=form-group><label for=game_size>Games sizes</label><input id=game_size name=game_size class=form-control ng-model=user.edit.game_size placeholder=\"50, 35, ...\"></div><div class=form-group><label for=ck_position>Favorite Caster Kill Positions</label><select id=ck_position name=ck_position class=form-control type=text ng-model=user.edit.ck_position multiple><option value=Missionary>Missionary</option><option value=69>69</option><option value=71>71</option><option value=47>47</option><option value=ln(2Pi)>ln(2Pi)</option><option value=WTF?>WTF?</option></select></div><div class=form-group><button type=submit class=\"btn btn-default\" ng-disabled=!user_form.$valid>Save User</button></div></form></div>"
  );

}]);
