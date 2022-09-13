import {createApp} from 'vue';
import App from './App.vue';
import PrimeVue from 'primevue/config';
import BadgeDirective from 'primevue/badgedirective';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import Toast from 'primevue/toast';
import Dialog from 'primevue/dialog';
import ConfirmDialog from 'primevue/confirmdialog';
import Menubar from 'primevue/menubar';
import PanelMenu from 'primevue/panelmenu';
import Button from "primevue/button";
import Sidebar from 'primevue/sidebar';
import InputText from "primevue/inputtext";
import InputMask from "primevue/inputmask";
import InputNumber from 'primevue/inputnumber';
import Password from 'primevue/password';
import Menu from 'primevue/menu';
import MultiSelect from 'primevue/multiselect';
import PickList from 'primevue/picklist';
import Listbox from 'primevue/listbox';
import AutoComplete from 'primevue/autocomplete';
import Textarea from 'primevue/textarea';
import Calendar from 'primevue/calendar';
import Paginator from 'primevue/paginator';
import DataView from 'primevue/dataview';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup';     //optional for column grouping
import Row from 'primevue/row';
import Dropdown from 'primevue/dropdown';
import FileUpload from 'primevue/fileupload';
import Skeleton from 'primevue/skeleton';
import Badge from 'primevue/badge';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Breadcrumb from 'primevue/breadcrumb';
import Avatar from "primevue/avatar";
import ScrollPanel from 'primevue/scrollpanel';
import 'primevue/resources/themes/saga-blue/theme.css';      //theme
import 'primevue/resources/primevue.min.css';                 //core css
import 'primeicons/primeicons.css';
import './style/base.css';
import router from './router';
import store from './store';
import setupInterceptors from './services/setupInterceptors';

setupInterceptors(store);

const app = createApp(App).use(store).use(router).use(ToastService).directive('badge', BadgeDirective).use(ConfirmationService).use(PrimeVue, {
    locale: {
        clear: 'Очистить',
        apply: 'Принять',
        accept: 'Да',
        reject: 'Нет',
        choose: 'Выбрать',
        upload: 'Загрузить',
        cancel: 'Отменить',
        dayNames: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
        dayNamesShort: ["Вс","Пн","Вт","Ср","Чт","Пн","Сб"],
        dayNamesMin: ["Вс","Пн","Вт","Ср","Чт","Пн","Сб"],
        monthNames: ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"],
        monthNamesShort: ["Янв.", "Февр.", "Март", "Апр.", "Май", "Июнь","Июль", "Авг.", "Сент.", "Окт.", "Нояб.", "Дек."],
        today: 'Сегодня',
        passwordPrompt: 'Введите пароль',
        emptyFilterMessage: 'Результаты не найдены',
        emptyMessage: 'Нет доступных опций'
    }
});

/* eslint-disable */
app.component('Toast', Toast)
    .component('Dialog', Dialog)
    .component('ConfirmDialog', ConfirmDialog)
    .component('Menubar', Menubar)
    .component('Menu', Menu)
    .component('PanelMenu', PanelMenu)
    .component('Sidebar', Sidebar)
    .component('Button', Button)
    .component('InputText', InputText)
    .component('Password', Password)
    .component('InputMask', InputMask)
    .component('InputNumber', InputNumber)
    .component('MultiSelect', MultiSelect)
    .component('PickList', PickList)
    .component('Listbox', Listbox)
    .component('AutoComplete', AutoComplete)
    .component('Textarea', Textarea)
    .component('Calendar', Calendar)
    .component('Paginator', Paginator)
    .component('DataView', DataView)
    .component('DataTable', DataTable)
    .component('Column', Column)
    .component('ColumnGroup', ColumnGroup)
    .component('Row', Row)
    .component('Dropdown', Dropdown)
    .component('FileUpload', FileUpload)
    .component('Skeleton', Skeleton)
    .component('Badge', Badge)
    .component('TabView', TabView)
    .component('TabPanel', TabPanel)
    .component('Breadcrumb',Breadcrumb)
    .component('Avatar', Avatar)
    .component('ScrollPanel', ScrollPanel)

app.mount('#app')
