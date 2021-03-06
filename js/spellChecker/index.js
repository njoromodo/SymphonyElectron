const { remote } = require('electron');
const { MenuItem } = remote;
const { isMac } = require('./../utils/misc');
const { SpellCheckHandler, ContextMenuListener, ContextMenuBuilder } = require('electron-spellchecker');

class SpellCheckHelper {

    /**
     * A constructor to create an instance of the spell checker
     */
    constructor() {
        this.spellCheckHandler = new SpellCheckHandler();
    }

    /**
     * Method to initialize spell checker
     */
    initializeSpellChecker() {
        this.spellCheckHandler.attachToInput();

        // This is only for window as in mac the
        // language is switched w.r.t to the current system language.
        //
        // In windows we need to implement RxJS observable
        // in order to switch language dynamically
        if (!isMac) {
            this.spellCheckHandler.switchLanguage('en-US');
        }

        const contextMenuBuilder = new ContextMenuBuilder(this.spellCheckHandler, null, false, SpellCheckHelper.processMenu);
        this.contextMenuListener = new ContextMenuListener((info) => {
            contextMenuBuilder.showPopupMenu(info);
        });
    }

    /**
     * Method to add default menu items to the
     * menu that was generated by ContextMenuBuilder
     *
     * This method will be invoked by electron-spellchecker
     * before showing the context menu
     *
     * @param menu
     * @returns menu
     */
    static processMenu(menu) {

        let isLink = false;
        menu.items.map((item) => {
            if (item.label === 'Copy Link'){
                isLink = true;
            }
            return item;
        });

        if (!isLink){
            menu.append(new MenuItem({ type: 'separator' }));
            menu.append(new MenuItem({
                role: 'reload',
                accelerator: 'CmdOrCtrl+R',
                label: 'Reload'
            }));
        }
        return menu;
    }

}

module.exports = {
    SpellCheckHelper: SpellCheckHelper
};