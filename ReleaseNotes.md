
# Release Notes

## Features
(b3fdffb) feat: onselect callback is also called programatically in picker component now --SakunPanthi123
(34cbbd1) feat: editable input, locklocale in headerProps, validaiton error box etc. added to single date picker --SakunPanthi123
(df52e03) feat: added editable and lockLocale prop both of which do what their names suggest. Rangepicker now listens to start date and end date props and changes panels and active selection if the props change. although one thing remains to do. setDateRange should use updateRangePicker day method to update day instead of doing all the custom panels and date setting. will implement this in next commit --SakunPanthi123
(f5247ef) feat: added setDatePickerRange method to the useRangePicker hook to allow listening to default dates updates and rerender the datepicker --SakunPanthi123

## Bug Fixes
(c29ec14) fix: removed 'en' setstate because setDatePickerRange method wasn't hanlding locales. this means only nepali dates will be continuosly listened for default props --SakunPanthi123

## Small tasks
(8e7f03a) chore: releasing 0.6.8 --SakunPanthi123
(2280b20) chore: picker input class changes --SakunPanthi123
(9bb6576) chore: added required, label, default classNames etc. --SakunPanthi123
(7647143) chore: added programmatic callback call to the updateRangePickerDay --SakunPanthi123
(af16b1b) chore: error handling, formatting and clear button behaviors updated --SakunPanthi123
(22fbf59) chore: if single panel mode is passed from prop, the left and right arrows don't disable in case the years and months are supported --SakunPanthi123
(c9dbd8e) chore: added ability to pass a prop for displaying single panel in range picker --SakunPanthi123
(22624f1) chore: fixed a bug and added some things --SakunPanthi123
(5dae668) chore: releasing 0.6.72 with fixes to updating selected day --SakunPanthi123

