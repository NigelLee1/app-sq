import {Injectable} from '@angular/core';
import {PickerController} from '@ionic/angular';

@Injectable({
    providedIn: 'root'
})
export class PickerService {

    constructor(public pickercontroller: PickerController) {
    }

    async openPicker(numColumns = 1, numOptions = 5, multiColumnOptions, callback) {
        const picker = await this.pickercontroller.create({
            columns: this.getColumns(numColumns, numOptions, multiColumnOptions),
            buttons: [
                {
                    text: '取消',
                    role: 'cancel'
                },
                {
                    text: '確定',
                    handler: value => {
                        callback(value);
                    }
                }
            ]
        });
        await picker.present();
    }

    getColumns(numColumns, numOptions, columnOptions) {
        const columns = [];
        for (let i = 0; i < numColumns; i++) {
            columns.push({
                name: `col-${i}`,
                options: this.getColumnOptions(i, numOptions, columnOptions)
            });
        }
        return columns;
    }

    getColumnOptions(columnIndex, numOptions, columnOptions) {
        const options = [];
        for (let i = 0; i < numOptions; i++) {
            options.push({
                text: columnOptions[columnIndex][i % numOptions],
                value: i
            });
        }
        return options;
    }
}
