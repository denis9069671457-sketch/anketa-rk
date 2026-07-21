import React, { useState, useEffect, useRef } from "react"; // v2
import LOGO_B64 from "./logo.png";
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{padding:40, textAlign:"center", fontFamily:"Arial"}}>
          <h2 style={{color:"#e84545", marginBottom:16}}>Ошибка загрузки</h2>
          <p style={{color:"#666", marginBottom:8}}>Пожалуйста, обновите страницу.</p>
          <p style={{color:"#aaa", fontSize:12}}>{String(this.state.error)}</p>
          <button onClick={()=>window.location.reload()} style={{marginTop:16, padding:"10px 24px", background:"#2ab5b5", color:"#fff", border:"none", borderRadius:8, cursor:"pointer", fontSize:14}}>Обновить</button>
        </div>
      );
    }
    return this.props.children;
  }
}



// ─── ПАЛИТРА ─────────────────────────────────────────────────────────────────
const C = {
  teal:      "#2ab5b5",
  tealDark:  "#1a8a8a",
  tealLight: "#e8f8f8",
  yellow:    "#f5c842",
  yellowDark:"#d4a800",
  yellowLight:"#fffbe6",
  gray:      "#4a5568",
  grayMid:   "#718096",
  grayLight: "#f4f6f8",
  grayBorder:"#e2e8f0",
  white:     "#ffffff",
  dark:      "#1a2a2a",
};


// ─── СПИСОК ДОКУМЕНТОВ ───────────────────────────────────────────────────────
const DOCUMENTS = [
  {
    id: "d1",
    category: "Критически важные исследования",
    required: true,
    items: [
      { id: "d1_1", label: "Заключение 8-часового ЭЭГ во сне", note: "Строгое обязательное условие. Не позднее 6 месяцев." },
      { id: "d1_2", label: "КСВП (Комплексное слуховое вызванное потенциал)", note: "Обследование у сурдолога, строго по протоколу во сне. Не позднее 6 месяцев." },
    ]
  },
  {
    id: "d2",
    category: "Анализы крови (за последние 3–6 месяцев)",
    required: true,
    items: [
      { id: "d2_1", label: "ОАК + СОЭ (общий анализ крови с лейкоформулой)", note: "" },
      { id: "d2_2", label: "Биохимия расширенная (печёночные пробы, гормоны щитовидной железы, глюкоза, ферритин)", note: "" },
      { id: "d2_3", label: "Кортизол (кровь)", note: "" },
      { id: "d2_4", label: "Аминокислоты крови (спектр)", note: "" },
    ]
  },
  {
    id: "d3",
    category: "Анализы мочи (за последние 3–6 месяцев)",
    required: false,
    items: [
      { id: "d3_1", label: "Органические кислоты мочи", note: "" },
      { id: "d3_2", label: "Ацилкарнитины", note: "Если данный анализ назначался ранее." },
    ]
  },
  {
    id: "d4",
    category: "Дополнительные заключения",
    required: false,
    items: [
      { id: "d4_1", label: "Заключение невролога", note: "" },
      { id: "d4_2", label: "Заключение генетика", note: "" },
      { id: "d4_3", label: "Заключение офтальмолога", note: "" },
      { id: "d4_4", label: "Результаты МРТ", note: "" },
      { id: "d4_5", label: "Результаты УЗИ", note: "" },
      { id: "d4_6", label: "Другие заключения узких специалистов", note: "" },
    ]
  },
];

// ─── ДАННЫЕ АНКЕТЫ ────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id:"s0", title:"Общие сведения о ребёнке", icon:"👶", color: C.teal,
    fields:[
      {id:"s0_1",label:"Фамилия, имя ребенка",type:"text"},
      {id:"s0_2",label:"Дата рождения ребенка",type:"text"},
      {id:"s0_3",label:"Возраст на момент прохождения диагностики",type:"text"},
      {id:"s0_4",label:"Город проживания",type:"text"},
    ]
  },
  {
    id:"s1", title:"Общие сведения о семье", icon:"👨‍👩‍👧", color:"#2ab580",
    fields:[
      {id:"s1_1",label:"Братья, сестры ребенка, их возраст, включая сводных (если сводный, указать)",type:"textarea"},
      {id:"s1_2",label:"Возраст отца в настоящий момент",type:"text"},
      {id:"s1_3",label:"Возраст матери в настоящий момент",type:"text"},
    ]
  },
  {
    id:"s2", title:"Данные о беременности и родах", icon:"🤰", color:"#e8a020",
    fields:[
      {id:"s2_1",label:"От какой по счету беременности ребенок? Если беременность многоплодная, укажите",type:"text"},
      {id:"s2_2",label:"Возраст матери и отца на момент беременности",type:"text"},
      {id:"s2_3",label:"Способ зачатия ребенка (естественный, ЭКО). Если ЭКО — укажите особенности процедуры и причины ЭКО",type:"textarea"},
      {id:"s2_4",label:"Какие по счету роды?",type:"text"},
      {id:"s2_5",label:"Хронические заболевания матери до наступления беременности. Укажите, если до беременности систематически употребляли алкоголь более 2 раз в месяц.",type:"textarea"},
      {id:"s2_6",label:"Чем закончились предыдущие беременности? Если были выкидыши или замершие беременности — найдите результаты гистологии и впишите их.",type:"textarea"},
      {id:"s2_7",label:"Особенности протекания беременности. Перечислите все заболевания с указанием недель, госпитализации, кровяные выделения, токсикоз, приём алкоголя/наркотиков/курение, набор веса, патологии плаценты и пр.",type:"textarea"},
      {id:"s2_8",label:"Ощущались ли движения плода как нормальные? Не казались ли они излишними или недостаточными?",type:"textarea"},
      {id:"s2_9",label:"Прием препаратов во время беременности (конкретные названия препаратов, причина назначения)",type:"textarea"},
      {id:"s2_10",label:"На какой неделе родился ребенок?",type:"text"},
      {id:"s2_11",label:"Роды самостоятельные или кесарево сечение? Если плановое кесарево — укажите причину и ждали ли начала самостоятельных схваток.",type:"textarea"},
      {id:"s2_12",label:"Особенности родов (стимуляция, анестезия, нетипичное предлежание, несвоевременное излитие вод, разрывы, обвитие пуповиной, акушерские пособия и пр.)",type:"textarea"},
      {id:"s2_13",label:"Длительность родов (от начала регулярных схваток)",type:"text"},
      {id:"s2_14",label:"Вес, рост при рождении",type:"text"},
      {id:"s2_15",label:"Закричал сразу? Характер крика.",type:"textarea"},
      {id:"s2_16",label:"Количество баллов по шкале Апгар (две цифры через «/»)",type:"text"},
      {id:"s2_17",label:"Был ли приложен к груди в родзале? Взял грудь активно или с трудом? Если не приложен — укажите причину.",type:"textarea"},
      {id:"s2_18",label:"На какие сутки выписаны?",type:"text"},
      {id:"s2_19",label:"Особенности ребенка после родов (кефалогематома, желтушка >10 дней, ИВЛ/кювез, пневмония, вялость или постоянный крик в первые трое суток и пр.)",type:"textarea"},
      {id:"s2_20",label:"Наличие пороков развития каких-либо органов, указать",type:"textarea"},
    ]
  },
  {
    id:"s3", title:"Данные о раннем периоде развития", icon:"🧸", color:"#7b5ea7",
    fields:[
      {id:"s3_1",label:"ГВ или ИВ, СВ: причина отсутствия ГВ; возраст отлучения от груди; причины если до 1 года или после 1,5 лет.",type:"textarea"},
      {id:"s3_2",label:"В каком возрасте самостоятельно сел (не усаживали, а сам сел посередине комнаты)?",type:"text"},
      {id:"s3_3",label:"В каком возрасте самостоятельно пополз?",type:"text"},
      {id:"s3_4",label:"Длительность ползания (дней/месяцев) и характер: на животе, на четвереньках и т.п.",type:"textarea"},
      {id:"s3_5",label:"В каком возрасте самостоятельно пошел (без руки мог перейти из одной комнаты в другую)?",type:"text"},
      {id:"s3_6",label:"Особенности сна ребенка до года, если были",type:"textarea"},
      {id:"s3_7",label:"Особенности вскармливания: молоко вытекало через нос, часто срыгивал, отказывался от еды, почти постоянно был на груди и пр.",type:"textarea"},
      {id:"s3_8",label:"Возраст первой улыбки в ответ на Ваше обращение к ребенку (не пишите по памяти, восстановите по видео). Частота улыбки в ответ: Всегда / часто / редко / иногда / никогда",type:"textarea"},
      {id:"s3_9",label:"Замечали ли особенности гуления и лепета?",type:"textarea"},
      {id:"s3_10",label:"Когда появились первые слова? Какие?",type:"textarea"},
      {id:"s3_11",label:"Когда появились фразы?",type:"text"},
      {id:"s3_12",label:"Тянул ли ребенок ручки к Вам, когда звал Вас, находясь в кроватке?",type:"textarea"},
      {id:"s3_13",label:"В каком возрасте Вы стали понимать по характеру плача ребенка, что именно он хочет?",type:"text"},
      {id:"s3_14",label:"Играл ли ребенок в ладушки?",type:"textarea"},
      {id:"s3_15",label:"Показывал ли жестом «пока-пока»?",type:"textarea"},
      {id:"s3_16",label:"Есть/был указательный жест?",type:"textarea"},
      {id:"s3_17",label:"В каком возрасте стала доступна имитация в игре в «прятки»?",type:"text"},
      {id:"s3_18",label:"Травмы головы в возрасте до 3 лет (включая незначительные падения с «синяками»)",type:"textarea"},
      {id:"s3_19",label:"Были ли атипичные реакции на вакцинацию? Опишите, если да.",type:"textarea"},
      {id:"s3_20",label:"Были ли у ребенка в возрасте до 3 лет признаки интоксикации: обезвоживание, рвота, диарея?",type:"textarea"},
      {id:"s3_21",label:"Были ли госпитализации в возрасте до года? Причина и сроки?",type:"textarea"},
      {id:"s3_22",label:"Были ли у ребенка «необъяснимые» повышения температуры? В каком возрасте?",type:"textarea"},
      {id:"s3_23",label:"Были ли у ребенка судороги (какие, когда, при каких условиях)?",type:"textarea"},
      {id:"s3_24",label:"Были ли у ребенка потери сознания (когда, при каких условиях)?",type:"textarea"},
      {id:"s3_25",label:"Были (есть) у ребенка астма, экзема, атопический дерматит? С какого возраста?",type:"textarea"},
      {id:"s3_26",label:"Энурез, энкопрез/запоры; «привычка» совершать акт дефекации по определённому ритуалу",type:"textarea"},
      {id:"s3_27",label:"Можно ли сказать, что ребенок часто падает и спотыкается? Были ли переломы, вывихи конечностей?",type:"textarea"},
      {id:"s3_28",label:"Наличие хронических заболеваний, включая остроту зрения, слуха, аденоиды и пр.",type:"textarea"},
      {id:"s3_29",label:"Бывают ли у Вашего ребенка эпизоды смеха «невпопад»? С какого возраста они появились?",type:"textarea"},
      {id:"s3_30",label:"Когда Вы вводили прикорм и говорили «открой ротик» — выполнял ли это ребенок? С какого возраста?",type:"textarea"},
      {id:"s3_31",label:"С какого возраста ребенок стал выполнять простые просьбы, типа «дай руку», «принеси мяч»?",type:"text"},
      {id:"s3_32",label:"В каком возрасте ребенок научился понимать слово «нельзя»?",type:"text"},
      {id:"s3_33",label:"На Ваш взгляд, Ваш ребенок: излишне привязан к Вам / привязанность обычная / недостаточно привязан к Вам (опишите проявления)",type:"textarea"},
      {id:"s3_34",label:"Можно ли назвать ребенка тревожным и боязливым? В чем проявляется?",type:"textarea"},
      {id:"s3_35",label:"Отмечаете ли Вы, что у ребенка отсутствуют типичные страхи: не боится машин, подходит к незнакомым людям и пр. Перечислите все.",type:"textarea"},
      {id:"s3_36",label:"Частота истерик: укажите в день/в неделю. Наиболее распространённые причины истерик",type:"textarea"},
      {id:"s3_37",label:"Перечислите, какие чувства свойственны Вашему ребенку (если ему больше 3 лет): чуткость к эмоциям других, заботливость, чувство долга и ответственность, стыд, радость познания нового",type:"textarea"},
      {id:"s3_38",label:"Оцените уровень самостоятельности ребенка: низкий / средний / высокий (чрезмерный)",type:"textarea"},
    ]
  },
  {
    id:"s4", title:"Условия проживания и навыки", icon:"🏠", color:"#2ab5b5",
    fields:[
      {id:"s4_1",label:"Родители проживают вместе/раздельно?",type:"text"},
      {id:"s4_2",label:"Родители состоят в официальном браке?",type:"text"},
      {id:"s4_3",label:"У ребенка отдельная комната?",type:"text"},
      {id:"s4_4",label:"Ребенок спит в отдельной кровати или с родителями? Если сон совместный — указать причину.",type:"textarea"},
      {id:"s4_5",label:"Ребенок совершает акт мочеиспускания произвольно и самостоятельно? Если нет — опишите объем помощи.",type:"textarea"},
      {id:"s4_6",label:"Ребенок совершает акт дефекации произвольно и самостоятельно? Если нет — опишите объем помощи, включая гигиену. Возраст приучения к горшку.",type:"textarea"},
      {id:"s4_7",label:"В каком возрасте перестали использовать подгузники?",type:"text"},
      {id:"s4_8",label:"Приучен ли ребенок есть самостоятельно?",type:"textarea"},
      {id:"s4_9",label:"Ест аккуратно?",type:"textarea"},
      {id:"s4_10",label:"Жует ли твердую пищу: пережевывает и проглатывает кусочек мяса (как кусок шашлыка)?",type:"textarea"},
      {id:"s4_11",label:"Может ли ребенок самостоятельно спускаться по лестнице? Приставным шагом или попеременным? В каком возрасте научился?",type:"textarea"},
      {id:"s4_12",label:"Может ли ребенок самостоятельно пить из чашки, не проливая?",type:"textarea"},
      {id:"s4_13",label:"Умеет ли пить из трубочки?",type:"textarea"},
      {id:"s4_14",label:"Умеет ли высмаркиваться?",type:"textarea"},
      {id:"s4_15",label:"Самостоятельно чистит зубы?",type:"textarea"},
      {id:"s4_16",label:"Самостоятельно совершает омовение в душе? Если нет — кто помогает?",type:"textarea"},
      {id:"s4_17",label:"Ребенок принимает пищу с просмотром видео параллельно? Сколько по времени в день ребенок смотрит телевизор/планшет/телефон?",type:"textarea"},
      {id:"s4_18",label:"В каком возрасте ребенок стал использовать гаджеты или телевизор?",type:"text"},
      {id:"s4_19",label:"Наличие специальной диеты? Показания?",type:"textarea"},
      {id:"s4_20",label:"Есть ли нарушения сна? Ранние пробуждения (раньше 6 утра), беспокойный сон, ночной энурез",type:"textarea"},
      {id:"s4_21",label:"Средняя длительность засыпания?",type:"text"},
      {id:"s4_22",label:"Нарушения аппетита? Избирательность в еде?",type:"textarea"},
      {id:"s4_23",label:"Умеет самостоятельно одеваться?",type:"textarea"},
      {id:"s4_24",label:"Умеет ли самостоятельно застегивать пуговицу, молнию, завязывать шнурки?",type:"textarea"},
    ]
  },
  {
    id:"s5", title:"Нарушения и система абилитации", icon:"🩺", color:"#e05050",
    fields:[
      {id:"s5_1",label:"В каком возрасте заметили отклонение?",type:"text"},
      {id:"s5_2",label:"Что именно заметили?",type:"textarea"},
      {id:"s5_3",label:"Если в Вашей семье есть другие дети — чем Ваш ребенок отличался от них всегда, с рождения?",type:"textarea"},
      {id:"s5_4",label:"Был ли «откат» в развитии ребенка? В каком возрасте, как протекал? С чем связываете его?",type:"textarea"},
      {id:"s5_5",label:"Какие симптомы были раньше, которые затем исчезли/сгладились?",type:"textarea"},
      {id:"s5_6",label:"Были ли периоды в развитии ребенка, когда навыки то появлялись, то исчезали? Если да — опишите подробнее.",type:"textarea"},
      {id:"s5_7",label:"Посещает ли ребенок образовательное учреждение? Если специальное — указать тип.",type:"textarea"},
      {id:"s5_8",label:"Как проходила адаптация к образовательному учреждению? Интерес к обучению/посещению?",type:"textarea"},
      {id:"s5_9",label:"Есть ли особенности поведения ребенка в учреждении по сравнению с домом?",type:"textarea"},
      {id:"s5_10",label:"Получена ли у ребенка инвалидность? Если да — по какому диагнозу?",type:"textarea"},
      {id:"s5_11",label:"С какого возраста начали системные занятия со специалистами?",type:"text"},
      {id:"s5_12",label:"Каких специалистов и в каком режиме посещает ребенок в настоящее время (с кем занимается и сколько раз в неделю)?",type:"textarea"},
      {id:"s5_13",label:"Что Вам нравится в занятиях специалистов? (обязательно для заполнения)",type:"textarea"},
      {id:"s5_14",label:"Что Вам не нравится? (обязательно для заполнения)",type:"textarea"},
    ]
  },
  {
    id:"s6", title:"Мотивация для прохождения диагностики", icon:"🎯", color:"#f5c842",
    fields:[
      {id:"s6_1",label:"Перечислите три основные особенности, которые отличают Вашего ребенка от сверстников в данный момент",type:"textarea"},
      {id:"s6_2",label:"В чем основная причина нарушений в развитии Вашего ребенка на Ваш взгляд?",type:"textarea"},
      {id:"s6_3",label:"Какое нарушение/диагноз Вы предполагаете у Вашего ребенка?",type:"textarea"},
      {id:"s6_4",label:"Какой официальный диагноз выставлен в настоящее время? Вы с ним согласны?",type:"textarea"},
      {id:"s6_5",label:"Какой самый неблагоприятный прогноз Вы видите для Вашего ребенка?",type:"textarea"},
      {id:"s6_6",label:"Какой самый благоприятный прогноз может быть, на Ваш взгляд?",type:"textarea"},
      {id:"s6_7",label:"От чего зависит прогноз развития ребенка, на Ваш взгляд? Назовите три пункта.",type:"textarea"},
      {id:"s6_8",label:"Опишите своего ребенка в 18 лет. Заполните от имени матери и от имени отца.",type:"textarea"},
      {id:"s6_9",label:"Сформулируйте, пожалуйста, Ваш основной запрос к специалисту на данную диагностику. Что для Вас является самым важным результатом этой встречи? (например: подтвердить/снять диагноз, получить план занятий, понять, в каком направлении двигаться дальше, получить направление в спец. учреждение)",type:"textarea"},
    ]
  },
  {
    id:"s7", title:"Семейный анамнез", icon:"💬", color:"#2ab5b5",
    fields:[
      {id:"s7_1",label:"Что для Вас лично означает «особенность» ребенка, что она изменила в Вашей жизни? Какие планы не осуществились?",type:"textarea"},
      {id:"s7_2",label:"Как распределены роли в Вашей семье? Кто лидер, кто обеспечивает занятия ребенка?",type:"textarea"},
      {id:"s7_3",label:"Опишите формат участия матери в жизни ребенка",type:"textarea"},
      {id:"s7_4",label:"Опишите формат участия отца в жизни ребенка",type:"textarea"},
      {id:"s7_5",label:"Назовите три главных воспитательных установки в вашей семье. Если они НЕ одинаковые у матери и отца — опишите разницу.",type:"textarea"},
      {id:"s7_6",label:"Выберите тип воспитания ребенка: гармоничное / неравномерное / гипоопека / гиперопека / «кумир семьи» / «Золушки»",type:"textarea"},
      {id:"s7_7",label:"Как часто родители ссорятся между собой при ребенке?",type:"textarea"},
      {id:"s7_8",label:"Применяются ли к ребенку физические наказания? Как часто? Причины, условия?",type:"textarea"},
      {id:"s7_9",label:"Какое нежелательное поведение имеется у ребенка: бьёт, грызет предметы, кричит и т.д.?",type:"textarea"},
      {id:"s7_10",label:"Предпочитаемые игрушки и деятельность, которой любит заниматься?",type:"textarea"},
    ]
  },
];

// ─── АНКЕТА СЕМЕЙНО-НАСЛЕДСТВЕННОГО ФОНА ─────────────────────────────────────
const FAMILY_SECTIONS = [
  {
    id:"f0", title:"Общие сведения", icon:"📋", color:"#2ab5b5",
    fields:[
      {id:"f0_1", label:"Фамилия, имя ребенка", type:"text"},
      {id:"f0_2", label:"Дата рождения", type:"text"},
      {id:"f0_3", label:"Возраст на момент прохождения диагностики (указываются года и месяцы жизни)", type:"text"},
      {id:"f0_4", label:"Город проживания", type:"text"},
    ]
  },
  {
    id:"f1", title:"Родственники со стороны матери", icon:"👩", color:"#e8a020",
    fields:[
      {id:"f1_1", label:"МАТЬ РЕБЁНКА — Хронические заболевания", type:"textarea"},
      {id:"f1_2", label:"МАТЬ РЕБЁНКА — Образование / специальность по диплому", type:"text"},
      {id:"f1_3", label:"МАТЬ РЕБЁНКА — Род деятельности (если предприниматель — укажите сферу)", type:"text"},
      {id:"f1_4", label:"МАТЬ РЕБЁНКА — Черты характера", type:"textarea"},
      {id:"f1_5", label:"БРАТЬЯ И СЁСТРЫ РЕБЁНКА ПО МАТЕРИ (заполнить на каждого, в скобках: родной/сводный/двоюродный) — Хронические заболевания", type:"textarea"},
      {id:"f1_6", label:"БРАТЬЯ И СЁСТРЫ ПО МАТЕРИ — Образование / специальность, род деятельности, черты характера", type:"textarea"},
      {id:"f1_7", label:"ТЁТЯ/ДЯДЯ РЕБЁНКА (описать каждого) — Хронические заболевания, образование, род деятельности, черты характера", type:"textarea"},
      {id:"f1_8", label:"БАБУШКА РЕБЁНКА (по матери) — Хронические заболевания, если умерла — возраст и причина смерти, образование, черты характера", type:"textarea"},
      {id:"f1_9", label:"ДЕДУШКА РЕБЁНКА (по матери) — Хронические заболевания, если умер — возраст и причина смерти, образование, черты характера", type:"textarea"},
      {id:"f1_10", label:"ПРАБАБУШКА (по матери) — Хронические заболевания, если умерла — возраст и причина смерти, черты характера", type:"textarea"},
      {id:"f1_11", label:"ПРАДЕДУШКА (по матери) — Хронические заболевания, если умер — возраст и причина смерти, черты характера", type:"textarea"},
      {id:"f1_12", label:"Опишите, если у кого-либо из ближайших родственников ЭТОЙ ВЕТВИ отмечались: странности поведения, нарушения речи, психиатрические диагнозы, необоснованные перепады настроения, приступы ярости, алкоголизм, эпилепсия, деменция, нарушения интеллекта, трудности при овладении чтением/письмом, аутизм, шизофрения, депрессия, суицид, черепно-мозговые травмы, наркомания, отбывание наказания (уточнить причину)", type:"textarea"},
      {id:"f1_13", label:"Опишите, если кто-либо из этой ветви был одарён: имеет учёную степень/звание, талантлив в рисовании, музыке, был «ходячей энциклопедией», знает несколько языков и т.п.", type:"textarea"},
    ]
  },
  {
    id:"f2", title:"Родственники со стороны отца", icon:"👨", color:"#7b5ea7",
    fields:[
      {id:"f2_1", label:"ОТЕЦ РЕБЁНКА — Хронические заболевания", type:"textarea"},
      {id:"f2_2", label:"ОТЕЦ РЕБЁНКА — Образование / специальность по диплому", type:"text"},
      {id:"f2_3", label:"ОТЕЦ РЕБЁНКА — Род деятельности (если предприниматель — укажите сферу)", type:"text"},
      {id:"f2_4", label:"ОТЕЦ РЕБЁНКА — Черты характера", type:"textarea"},
      {id:"f2_5", label:"БРАТЬЯ И СЁСТРЫ РЕБЁНКА ПО ОТЦУ (заполнить на каждого, в скобках: родной/сводный/двоюродный) — Хронические заболевания", type:"textarea"},
      {id:"f2_6", label:"БРАТЬЯ И СЁСТРЫ ПО ОТЦУ — Образование / специальность, род деятельности, черты характера", type:"textarea"},
      {id:"f2_7", label:"ТЁТЯ/ДЯДЯ РЕБЁНКА (со стороны отца, описать каждого) — Хронические заболевания, образование, род деятельности, черты характера", type:"textarea"},
      {id:"f2_8", label:"БАБУШКА РЕБЁНКА (по отцу) — Хронические заболевания, если умерла — возраст и причина смерти, образование, черты характера", type:"textarea"},
      {id:"f2_9", label:"ДЕДУШКА РЕБЁНКА (по отцу) — Хронические заболевания, если умер — возраст и причина смерти, образование, черты характера", type:"textarea"},
      {id:"f2_10", label:"ПРАБАБУШКА (по отцу) — Хронические заболевания, если умерла — возраст и причина смерти, черты характера", type:"textarea"},
      {id:"f2_11", label:"ПРАДЕДУШКА (по отцу) — Хронические заболевания, если умер — возраст и причина смерти, черты характера", type:"textarea"},
      {id:"f2_12", label:"Опишите, если у кого-либо из ближайших родственников ЭТОЙ ВЕТВИ отмечались: странности поведения, нарушения речи, психиатрические диагнозы, необоснованные перепады настроения, приступы ярости, алкоголизм, эпилепсия, деменция, нарушения интеллекта, трудности при овладении чтением/письмом, аутизм, шизофрения, депрессия, суицид, черепно-мозговые травмы, наркомания, отбывание наказания (уточнить причину)", type:"textarea"},
      {id:"f2_13", label:"Опишите, если кто-либо из этой ветви был одарён: имеет учёную степень/звание, талантлив в рисовании, музыке, был «ходячей энциклопедией», знает несколько языков и т.п.", type:"textarea"},
    ]
  },
  {
    id:"f3", title:"Ваш ребёнок", icon:"🧒", color:"#2ab580",
    fields:[
      {id:"f3_1", label:"Чем не любит заниматься", type:"textarea"},
      {id:"f3_2", label:"Любимые занятия", type:"textarea"},
      {id:"f3_3", label:"Черты характера ребёнка (оставьте подходящее, остальное удалите или зачеркните): излишне педантичный и аккуратный; спокойный, покладистый; гневливый, с/без физической агрессии; обидчивый, подолгу не забывает обиды; с непредсказуемыми необоснованными перепадами настроения; чудаковатый в поведении; преимущественно грустный; преимущественно весёлый; может смеяться без причины; медлительный; чувствительный, ранимый; преувеличивает проблемы; чрезмерно общительный, болтливый; склонен к озорству и вредительству; не оценивает социальную дистанцию со взрослыми; тревожный, пугливый; капризный, плаксивый; не переносит одиночество; замкнутый, отгороженный", type:"textarea"},
    ]
  },
];

const ALL_FAMILY_FIELDS = FAMILY_SECTIONS.flatMap(s => s.fields);
const FAMILY_TOTAL = ALL_FAMILY_FIELDS.length;

const ALL_FIELDS = SECTIONS.flatMap(s => s.fields);
const TOTAL = ALL_FIELDS.length;
const ADMIN_PASSWORD = "3211";

// ─── Word export ──────────────────────────────────────────────────────────────
function exportToWord(submission) {
  const esc = (t) => String(t||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const isFamily = submission.form_type === "family";
  const isDocs = submission.form_type === "documents";

  // Определяем разделы и название в зависимости от типа анкеты
  const sections = isFamily ? FAMILY_SECTIONS : SECTIONS;
  const title = isFamily
    ? "Анкета для определения семейно-наследственного фона"
    : "Анкета по сбору анамнеза по стандарту М.И. Лынской";
  const childKey = isFamily ? "f0_1" : "s0_1";
  const dobKey = isFamily ? "f0_2" : "s0_2";
  const ageKey = isFamily ? "f0_3" : "s0_3";
  const cityKey = isFamily ? "f0_4" : "s0_4";

  // Если это документы — отдельный шаблон
  if (isDocs) {
    const checked = (() => { try { return JSON.parse(submission.answers?.checkedDocs || "{}"); } catch(e) { return {}; } })();
    const fileNames = (() => { try { return JSON.parse(submission.answers?.fileNames || "[]"); } catch(e) { return []; } })();
    const fileData = (() => { try { return JSON.parse(submission.answers?.fileData || "[]"); } catch(e) { return []; } })();
    const totalChecked = Object.values(checked).filter(Boolean).length;

    let html = `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"/>
    <style>@media print{.bar{display:none!important}body{margin:10mm 15mm}}body{font-family:Arial,sans-serif;font-size:12px;margin:20px 30px;color:#111}.bar{position:fixed;top:0;left:0;right:0;background:#1a2a2a;padding:10px 20px;display:flex;gap:12px;align-items:center;z-index:99}.bar span{color:#2ab5b5;font-weight:bold;flex:1}.bp{background:#2ab5b5;color:white;border:none;border-radius:8px;padding:8px 18px;font-size:13px;font-weight:bold;cursor:pointer}.cnt{margin-top:52px}.ttl{text-align:center;margin-bottom:16px}.ttl h1{font-size:15px;font-weight:bold;margin:0 0 4px}.ttl p{font-size:11px;color:#555;margin:2px 0}h2{font-size:13px;font-weight:bold;background:#f0ecf8;border:1px solid #aaa;padding:5px;margin:10px 0 0}.row{display:flex;align-items:center;gap:8px;padding:6px 10px;border-bottom:1px solid #eee;font-size:12px}.chk{font-size:16px}.file{color:#2ab5b5;font-weight:bold}</style>
    </head><body>
    <div class="bar"><span>Документы: ${esc(submission.parent_name||"—")}</span><button class="bp" onclick="window.print()">🖨️ Печать</button></div>
    <div class="cnt"><div class="ttl"><h1>Список документов клиента</h1><p>Центр Рината Каримова · ${new Date(submission.date).toLocaleString("ru-RU")}</p><p>Родитель: <b>${esc(submission.parent_name||"—")}</b> · Отмечено: ${totalChecked} документов</p></div>`;

    DOCUMENTS.forEach(group => {
      html += `<h2>${esc(group.category)}${group.required?" (ОБЯЗАТЕЛЬНО)":""}</h2>`;
      group.items.forEach(item => {
        const isChecked = checked[item.id];
        const file = fileNames.find(f => f.docId === item.id);
        const fd = fileData.find(f => f.docId === item.id);
        html += `<div class="row"><span class="chk">${isChecked?"✅":"⬜"}</span><span style="flex:1">${esc(item.label)}</span>`;
        if (file && fd) html += `<a class="file" href="${fd.data}" download="${file.fileName}">📎 ${esc(file.fileName)}</a>`;
        html += `</div>`;
      });
    });

    if (submission.answers?.comment) {
      html += `<div style="margin-top:16px;padding:12px;background:#f9f9f9;border-radius:8px;font-size:12px"><b>Комментарий:</b> ${esc(submission.answers.comment)}</div>`;
    }
    html += `</div></body></html>`;
    window.open(URL.createObjectURL(new Blob([html],{type:"text/html;charset=utf-8"})),"_blank");
    return;
  }

  // Анкета Лынской или Семейный фон
  let html = `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"/>
  <style>
    @media print { .top-bar { display: none !important; } body { margin: 10mm 15mm; } }
    body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px 30px; color: #111; }
    .top-bar { position: fixed; top: 0; left: 0; right: 0; background: #1a2a2a; padding: 10px 20px; display: flex; gap: 12px; align-items: center; z-index: 99; }
    .top-bar span { color: #2ab5b5; font-weight: bold; font-size: 14px; flex: 1; }
    .btn-print { background: #2ab5b5; color: white; border: none; border-radius: 8px; padding: 8px 18px; font-size: 13px; font-weight: bold; cursor: pointer; }
    .content { margin-top: 52px; }
    .title-block { text-align: center; margin-bottom: 16px; }
    .title-block h1 { font-size: 15px; font-weight: bold; margin: 0 0 4px; }
    .title-block p { font-size: 11px; color: #555; margin: 2px 0; }
    table { width: 100%; border-collapse: collapse; }
    h2 { font-size: 13px; font-weight: bold; text-align: center; background: ${isFamily ? "#f0ecf8" : "#e8f5f5"}; border: 1px solid #aaa; padding: 5px; margin: 10px 0 0; }
    td { border: 1px solid #999; border-top: none; padding: 5px 8px; font-size: 11px; vertical-align: top; }
    .q-cell { width: 55%; background: #fafafa; }
    .q-num { color: #888; font-size: 10px; margin-right: 4px; }
    .empty { color: #bbb; font-style: italic; }
  </style></head><body>
  <div class="top-bar">
    <span>${esc(title)}: ${esc(submission.answers?.[childKey]||"—")}</span>
    <button class="btn-print" onclick="window.print()">🖨️ Печать / PDF</button>
    <span style="background:#f5c842;color:#1a2a2a;border-radius:8px;padding:8px 14px;font-size:11px;font-weight:bold">iPad: Печать → Файлы</span>
  </div>
  <div class="content">
    <div class="title-block">
      <h1>${esc(title)}</h1>
      <p>Центр Рината Каримова · Дата: ${new Date(submission.date).toLocaleString("ru-RU")}</p>
      <p>Родитель: <b>${esc(submission.parent_name||"—")}</b></p>
    </div>
    <table>
      <tr><td class="q-cell">Фамилия, имя ребенка</td><td>${esc(submission.answers?.[childKey])}</td></tr>
      <tr><td class="q-cell">Дата рождения</td><td>${esc(submission.answers?.[dobKey])}</td></tr>
      <tr><td class="q-cell">Возраст на момент диагностики</td><td>${esc(submission.answers?.[ageKey])}</td></tr>
      <tr><td class="q-cell">Город проживания</td><td>${esc(submission.answers?.[cityKey])}</td></tr>
    </table>`;

  sections.slice(1).forEach(sec => {
    html += `<h2>${sec.icon || ""} ${esc(sec.title)}</h2><table>`;
    sec.fields.forEach((f, i) => {
      const ans = submission.answers?.[f.id];
      html += `<tr><td class="q-cell"><span class="q-num">${i+1}.</span>${esc(f.label)}</td><td class="${ans?"":"empty"}">${esc(ans)}</td></tr>`;
    });
    html += `</table>`;
  });

  html += `</div></body></html>`;
  window.open(URL.createObjectURL(new Blob([html],{type:"text/html;charset=utf-8"})),"_blank");
}


function Logo({ size = 48 }) {
  return <img src={LOGO_B64} alt="RK Logo" style={{ width: size, height: size, objectFit:"contain" }} />;
}



const inputStyle = { width:"100%", border:"1.5px solid #e2e8f0", borderRadius:8, padding:"10px 14px", fontSize:14, color:C.dark, outline:"none", resize:"vertical", boxSizing:"border-box", background:"#fafcfc", fontFamily:"inherit", transition:"border-color .2s" };

function Field({ field, value, onChange }) {
  const [focused, setFocused] = useState(false);
  const style = { ...inputStyle, borderColor: focused ? C.teal : C.grayBorder };
  return field.type === "textarea"
    ? <textarea rows={3} style={style} value={value||""} onChange={e=>onChange(e.target.value)} placeholder="Введите ответ..." onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}/>
    : <input type="text" style={style} value={value||""} onChange={e=>onChange(e.target.value)} placeholder="Введите ответ..." onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}/>;
}

function ProgressBar({ pct, color, height=6 }) {
  return <div style={{height,background:C.grayBorder,borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:color||C.teal,borderRadius:4,transition:"width .4s"}}/></div>;
}

function Badge({ color, children }) {
  return <span style={{display:"inline-block",padding:"2px 10px",borderRadius:12,fontSize:11,fontWeight:700,background:color+"22",color,border:`1px solid ${color}44`}}>{children}</span>;
}

function Btn({ onClick, variant="primary", disabled, children, style:extra={} }) {
  const base = {padding:"10px 24px",borderRadius:8,border:"none",cursor:disabled?"not-allowed":"pointer",fontSize:14,fontWeight:700,transition:"all .2s",opacity:disabled?0.5:1};
  const styles = {
    primary:{...base,background:C.teal,color:"#fff"},
    yellow:{...base,background:C.yellow,color:C.dark},
    ghost:{...base,background:C.grayLight,color:C.gray},
  };
  return <button onClick={disabled?undefined:onClick} style={{...styles[variant],...extra}}>{children}</button>;
}

// ─── Header ───────────────────────────────────────────────────────────────────
function Header({ view, setView, auth, onLogout }) {
  const navItems = [
    { key:"client", label:"📋 Анкета М.И. Лынской" },
    { key:"family", label:"🧬 Семейный фон" },
    { key:"docs",   label:"📎 Документы" },
    { key:"admin",  label: auth ? "👤 Администратор" : "🔐 Администратор" },
  ];
  const handleNav = (key) => { if (key==="admin") { auth?setView("admin"):setView("adminLogin"); } else { setView(key); } };
  const isActive = (key) => view===key || (key==="admin" && view==="adminLogin");
  return (
    <header style={{background:C.dark,borderBottom:`3px solid ${C.teal}`,position:"sticky",top:0,zIndex:100}}>
      <div style={{maxWidth:900,margin:"0 auto",padding:"10px 16px 0",display:"flex",alignItems:"center",gap:12}}>
        <Logo size={36}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{color:C.yellow,fontWeight:700,fontSize:14,lineHeight:1.2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>Центр Рината Каримова</div>
          <div style={{color:C.teal,fontSize:10,marginTop:1}}>Анкета М.И. Лынской</div>
        </div>
        {auth && view==="admin" && <button onClick={onLogout} style={{flexShrink:0,background:"transparent",border:"1px solid rgba(255,255,255,0.2)",color:"rgba(255,255,255,0.5)",borderRadius:16,padding:"4px 10px",cursor:"pointer",fontSize:11}}>Выйти</button>}
      </div>
      <div style={{maxWidth:900,margin:"0 auto",padding:"8px 16px 10px",display:"flex",gap:6,overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
        {navItems.map(item=>(
          <button key={item.key} onClick={()=>handleNav(item.key)} style={{flexShrink:0,padding:"6px 14px",borderRadius:16,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,whiteSpace:"nowrap",background:isActive(item.key)?C.teal:"rgba(255,255,255,0.1)",color:isActive(item.key)?"#fff":"rgba(255,255,255,0.65)"}}>
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
}

// ─── Welcome screen ───────────────────────────────────────────────────────────
function WelcomeScreen({ onStart }) {
  return (
    <div style={{maxWidth:780,margin:"0 auto",padding:"40px 20px"}}>
      <div style={{background:C.white,borderRadius:20,boxShadow:"0 4px 24px rgba(42,181,181,0.12)",overflow:"hidden"}}>
        <div style={{background:`linear-gradient(135deg,${C.dark} 0%,#1a3a3a 100%)`,padding:"36px 40px",display:"flex",alignItems:"center",gap:28}}>
          <Logo size={80}/>
          <div>
            <h1 style={{color:C.yellow,fontSize:26,margin:"0 0 6px",fontWeight:800}}>Анкета по сбору анамнеза</h1>
            <p style={{color:C.teal,fontSize:14,margin:0}}>По стандарту М.И. Лынской</p>
          </div>
        </div>
        <div style={{padding:"32px 40px"}}>
          <div style={{background:C.tealLight,borderRadius:12,padding:20,marginBottom:28,borderLeft:`4px solid ${C.teal}`,fontSize:14,color:"#333",lineHeight:1.8}}>
            Анкета содержит <b style={{color:C.tealDark}}>{TOTAL} вопросов</b>, разбитых на <b style={{color:C.tealDark}}>{SECTIONS.length} разделов</b>. Пожалуйста, отвечайте максимально подробно.
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:32}}>
            {SECTIONS.map(s=>(
              <div key={s.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:C.grayLight,borderRadius:10,border:`1px solid ${C.grayBorder}`}}>
                <span style={{fontSize:20}}>{s.icon}</span>
                <span style={{fontSize:13,color:C.gray,flex:1}}>{s.title}</span>
                <Badge color={s.color}>{s.fields.length}</Badge>
              </div>
            ))}
          </div>
          <Btn onClick={onStart} variant="primary" style={{fontSize:15,padding:"12px 32px"}}>Начать заполнение →</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── SectionBlock ─────────────────────────────────────────────────────────────
function SectionBlock({ section, answers, onChange }) {
  const filled = section.fields.filter(f=>answers[f.id]).length;
  const pct = Math.round(filled/section.fields.length*100);
  return (
    <div style={{background:C.white,borderRadius:16,boxShadow:"0 2px 12px rgba(0,0,0,0.06)",marginBottom:24,overflow:"hidden"}}>
      <div style={{background:`linear-gradient(90deg,${section.color}18,transparent)`,borderTop:`3px solid ${section.color}`,padding:"20px 28px 16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
          <span style={{fontSize:22}}>{section.icon}</span>
          <span style={{fontSize:17,fontWeight:700,color:C.dark}}>{section.title}</span>
          <span style={{marginLeft:"auto",display:"inline-block",padding:"2px 10px",borderRadius:12,fontSize:11,fontWeight:700,background:section.color+"22",color:section.color,border:`1px solid ${section.color}44`}}>{filled}/{section.fields.length}</span>
        </div>
        <ProgressBar pct={pct} color={section.color}/>
      </div>
      <div style={{padding:"20px 28px"}}>
        {section.fields.map((f,i)=>(
          <div key={f.id} style={{marginBottom:22}}>
            <div style={{fontSize:11,color:C.grayMid,marginBottom:4}}>Вопрос {i+1}</div>
            <div style={{fontSize:14,color:C.gray,marginBottom:8,lineHeight:1.6,fontWeight:500}}>{f.label}</div>
            <Field field={f} value={answers[f.id]} onChange={v=>onChange(f.id,v)}/>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Consent screen ───────────────────────────────────────────────────────────
function ConsentScreen({ onAccept }) {
  const [checked, setChecked] = useState(false);
  const [parentName, setParentName] = useState("");
  const [nameErr, setNameErr] = useState(false);
  const handle = () => { if(!parentName.trim()){setNameErr(true);return;} if(!checked)return; onAccept(parentName.trim()); };
  return (
    <div style={{maxWidth:780,margin:"0 auto",padding:"40px 20px"}}>
      <div style={{background:C.white,borderRadius:20,boxShadow:"0 4px 24px rgba(42,181,181,0.12)",overflow:"hidden"}}>
        <div style={{background:`linear-gradient(135deg,${C.dark} 0%,#1a3a3a 100%)`,padding:"28px 36px",display:"flex",alignItems:"center",gap:20}}>
          <Logo size={56}/>
          <div>
            <h1 style={{color:C.yellow,fontSize:20,margin:"0 0 4px",fontWeight:800}}>Согласие на обработку персональных данных</h1>
            <p style={{color:C.teal,fontSize:13,margin:0}}>В соответствии с Федеральным законом № 152-ФЗ</p>
          </div>
        </div>
        <div style={{padding:"28px 36px"}}>
          <div style={{background:C.tealLight,borderRadius:10,padding:"12px 18px",marginBottom:20,fontSize:12,color:C.gray,lineHeight:1.8}}>
            <b style={{color:C.tealDark}}>Оператор:</b> ИП Каримов Ринат Алишерович · ИНН 502239463615<br/>
            143401, Московская область, г. Красногорск, бульвар Павшинский, д. 3
          </div>
          <div style={{background:"#f8fefe",border:`1px solid ${C.tealLight}`,borderRadius:12,padding:"20px 24px",marginBottom:20,maxHeight:280,overflowY:"auto",fontSize:13,color:"#333",lineHeight:1.8}}>
            <p style={{fontWeight:700,marginBottom:12,fontSize:14,textAlign:"center"}}>СОГЛАСИЕ НА ОБРАБОТКУ ПЕРСОНАЛЬНЫХ ДАННЫХ</p>
            <p>Я, являясь родителем (законным представителем) несовершеннолетнего ребёнка, в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ, даю согласие <b>ИП Каримов Ринат Алишерович</b> на обработку персональных данных в целях диагностики и составления рекомендаций.</p>
            <p style={{marginTop:10,fontWeight:600}}>Перечень данных:</p>
            <p>ФИО ребёнка и родителя, дата рождения, сведения о здоровье, семейный анамнез, данные о развитии ребёнка.</p>
            <p style={{marginTop:10,fontWeight:600}}>Срок и отзыв:</p>
            <p>До достижения целей обработки. Отзыв — письменное заявление Оператору. Данные уничтожаются в течение 30 дней.</p>
          </div>
          <div style={{marginBottom:16}}>
            <label style={{display:"block",fontSize:13,fontWeight:600,color:C.dark,marginBottom:6}}>ФИО родителя (законного представителя) <span style={{color:"#e84545"}}>*</span></label>
            <input type="text" placeholder="Например: Иванова Мария Петровна" value={parentName}
              onChange={e=>{setParentName(e.target.value);setNameErr(false);}}
              style={{...inputStyle,borderColor:nameErr?"#e84545":parentName?C.teal:C.grayBorder}}/>
            {nameErr&&<p style={{color:"#e84545",fontSize:12,margin:"4px 0 0"}}>Пожалуйста, укажите ФИО</p>}
          </div>
          <div onClick={()=>setChecked(p=>!p)} style={{display:"flex",alignItems:"flex-start",gap:12,cursor:"pointer",marginBottom:24,padding:"14px 18px",background:checked?"#e8f8f8":C.grayLight,borderRadius:10,border:`2px solid ${checked?C.teal:C.grayBorder}`,transition:"all .2s"}}>
            <div style={{width:22,height:22,borderRadius:5,border:`2px solid ${checked?C.teal:"#aaa"}`,background:checked?C.teal:"#fff",flexShrink:0,marginTop:1,display:"flex",alignItems:"center",justifyContent:"center"}}>
              {checked&&<span style={{color:"#fff",fontSize:14,fontWeight:900}}>✓</span>}
            </div>
            <p style={{margin:0,fontSize:13,color:"#333",lineHeight:1.6}}>Я ознакомился(-ась) с условиями и даю согласие на обработку персональных данных своих и своего ребёнка в соответствии с Федеральным законом № 152-ФЗ.</p>
          </div>
          <Btn onClick={handle} variant="primary" disabled={!checked||!parentName.trim()} style={{fontSize:15,padding:"13px 36px",opacity:(checked&&parentName.trim())?1:0.4}}>
            Согласен(на) — перейти к анкете →
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ─── ClientForm ───────────────────────────────────────────────────────────────
function ClientForm({ onSubmit }) {
  const [step, setStep] = useState("consent");
  const [curSec, setCurSec] = useState(0);
  const [answers, setAnswers] = useState({});
  const [parentName, setParentName] = useState("");
  const [familyCurSec, setFamilyCurSec] = useState(0);
  const [familyAnswers, setFamilyAnswers] = useState({});
  const topRef = useRef(null);
  const filled = ALL_FIELDS.filter(f=>answers[f.id]).length;
  const pct = Math.round(filled/TOTAL*100);
  const handleChange = (id,val) => setAnswers(p=>({...p,[id]:val}));
  const goSec = (n) => { setCurSec(n); setTimeout(()=>topRef.current?.scrollIntoView({behavior:"smooth"}),50); };

  if(step==="consent") return <ConsentScreen onAccept={(name)=>{setParentName(name);setStep("welcome");}}/>;
  if(step==="done") return (
    <div style={{maxWidth:640,margin:"40px auto",padding:"0 20px",textAlign:"center"}}>
      <div style={{background:C.white,borderRadius:20,padding:"48px 40px",boxShadow:"0 4px 24px rgba(42,181,181,0.12)",marginBottom:20}}>
        <Logo size={72}/><div style={{fontSize:52,marginBottom:12,marginTop:16}}>✅</div>
        <h2 style={{color:C.dark,fontSize:22,marginBottom:8}}>Анкета отправлена!</h2>
        <p style={{color:C.grayMid,fontSize:14}}>Спасибо! Первая анкета успешно передана специалисту.</p>
      </div>
      <div style={{background:"linear-gradient(135deg,#2a1a3a,#1a2a2a)",borderRadius:20,padding:"32px 36px",boxShadow:"0 4px 24px rgba(123,94,167,0.25)"}}>
        <div style={{fontSize:40,marginBottom:12}}>🧬</div>
        <h3 style={{color:C.yellow,fontSize:20,fontWeight:800,marginBottom:8}}>Необходимо заполнить вторую анкету</h3>
        <p style={{color:"rgba(255,255,255,0.75)",fontSize:14,marginBottom:24,lineHeight:1.7}}>
          Для полноценной диагностики специалисту также нужна <b style={{color:"#9b7fd4"}}>Анкета семейно-наследственного фона</b>.
        </p>
        <Btn onClick={()=>{setStep("family");setFamilyCurSec(0);setFamilyAnswers({});}} variant="yellow" style={{fontSize:15,padding:"14px 32px"}}>
          Заполнить анкету семейного фона →
        </Btn>
      </div>
    </div>
  );
  if(step==="familyDone") return (
    <DocumentsScreen parentName={parentName} childName={answers["s0_1"]||""}
      onSubmit={async(docData)=>{await onSubmit({...docData,answers:{...docData.answers,s0_1:answers["s0_1"]||""}});setStep("allDone");}}/>
  );
  if(step==="allDone") return (
    <div style={{maxWidth:600,margin:"60px auto",padding:"0 20px",textAlign:"center"}}>
      <div style={{background:C.white,borderRadius:20,padding:"60px 40px",boxShadow:"0 4px 24px rgba(42,181,181,0.12)"}}>
        <Logo size={80}/><div style={{fontSize:56,marginBottom:16,marginTop:16}}>🎉</div>
        <h2 style={{color:C.dark,fontSize:24,marginBottom:10}}>Всё готово!</h2>
        <p style={{color:C.grayMid,fontSize:15,marginBottom:8}}>Обе анкеты и список документов успешно переданы специалисту.</p>
        <p style={{color:C.teal,fontSize:13}}>Специалист свяжется с вами для уточнения деталей диагностики.</p>
      </div>
    </div>
  );
  if(step==="welcome") return <WelcomeScreen onStart={()=>setStep("form")}/>;
  if(step==="family") {
    const FSECS = FAMILY_SECTIONS;
    const FALL = FSECS.flatMap(s=>s.fields);
    const fFilled = FALL.filter(f=>familyAnswers[f.id]).length;
    const fPct = FALL.length>0 ? Math.round(fFilled/FALL.length*100) : 0;
    const fSec = FSECS[familyCurSec]||null;
    const goFSec = (n)=>{setFamilyCurSec(n);setTimeout(()=>topRef.current?.scrollIntoView({behavior:"smooth"}),50);};
    if(!fSec) return null;
    return (
      <div style={{maxWidth:820,margin:"0 auto",padding:"28px 20px"}}>
        <div ref={topRef}/>
        <div style={{background:"linear-gradient(135deg,#2a1a3a,#1a2a2a)",borderRadius:14,padding:"16px 24px",marginBottom:20,display:"flex",alignItems:"center",gap:14}}>
          <span style={{fontSize:28}}>🧬</span>
          <div>
            <p style={{color:C.yellow,fontWeight:700,fontSize:15,margin:0}}>Анкета семейно-наследственного фона</p>
            <p style={{color:"rgba(255,255,255,0.6)",fontSize:12,margin:"4px 0 0"}}>Вторая анкета — шаг {familyCurSec+1} из {FSECS.length}</p>
          </div>
          <span style={{marginLeft:"auto",color:"#9b7fd4",fontWeight:700,fontSize:14}}>{fPct}%</span>
        </div>
        <div style={{background:C.white,borderRadius:16,boxShadow:"0 2px 12px rgba(0,0,0,0.06)",padding:"16px 20px",marginBottom:20}}>
          <ProgressBar pct={fPct} color="linear-gradient(90deg,#7b5ea7,#f5c842)" height={8}/>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:12}}>
            {FSECS.map((s,i)=>{const sf=s.fields.filter(f=>familyAnswers[f.id]).length;const done=sf===s.fields.length;const active=familyCurSec===i;return(<button key={s.id} onClick={()=>goFSec(i)} style={{padding:"5px 12px",borderRadius:20,cursor:"pointer",fontSize:12,fontWeight:600,border:`2px solid ${active?s.color:done?s.color+"66":C.grayBorder}`,background:active?s.color:done?s.color+"15":C.grayLight,color:active?"#fff":done?s.color:C.grayMid}}>{s.icon} {sf}/{s.fields.length}</button>);})}
          </div>
        </div>
        <SectionBlock section={fSec} answers={familyAnswers} onChange={(id,val)=>setFamilyAnswers(p=>({...p,[id]:val}))}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:4}}>
          <Btn onClick={()=>goFSec(familyCurSec-1)} variant="ghost" disabled={familyCurSec===0}>← Назад</Btn>
          <span style={{fontSize:13,color:C.grayMid}}>Раздел {familyCurSec+1} из {FSECS.length}</span>
          {familyCurSec<FSECS.length-1
            ?<Btn onClick={()=>goFSec(familyCurSec+1)} variant="primary" style={{background:"#7b5ea7"}}>Далее →</Btn>
            :<Btn onClick={async()=>{const sub={id:Date.now(),date:new Date().toISOString(),answers:{...familyAnswers},parentName,formType:"family"};await onSubmit(sub);setStep("familyDone");}} variant="yellow">✅ Отправить обе анкеты</Btn>
          }
        </div>
      </div>
    );
  }
  const sec = SECTIONS[curSec];
  return (
    <div style={{maxWidth:820,margin:"0 auto",padding:"28px 20px"}}>
      <div ref={topRef}/>
      <div style={{background:C.white,borderRadius:16,boxShadow:"0 2px 12px rgba(0,0,0,0.06)",padding:"20px 24px",marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <span style={{fontWeight:700,color:C.dark,fontSize:14}}>Общий прогресс</span>
          <span style={{color:C.teal,fontWeight:700,fontSize:14}}>{pct}% · {filled}/{TOTAL}</span>
        </div>
        <ProgressBar pct={pct} color={`linear-gradient(90deg,${C.teal},${C.yellow})`} height={8}/>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:14}}>
          {SECTIONS.map((s,i)=>{const sf=s.fields.filter(f=>answers[f.id]).length;const done=sf===s.fields.length;const active=curSec===i;return(<button key={s.id} onClick={()=>goSec(i)} style={{padding:"5px 12px",borderRadius:20,cursor:"pointer",fontSize:12,fontWeight:600,border:`2px solid ${active?s.color:done?s.color+"66":C.grayBorder}`,background:active?s.color:done?s.color+"15":C.grayLight,color:active?"#fff":done?s.color:C.grayMid}}>{s.icon} {sf}/{s.fields.length}</button>);})}
        </div>
      </div>
      <SectionBlock section={sec} answers={answers} onChange={handleChange}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:4}}>
        <Btn onClick={()=>goSec(curSec-1)} variant="ghost" disabled={curSec===0}>← Назад</Btn>
        <span style={{fontSize:13,color:C.grayMid}}>Раздел {curSec+1} из {SECTIONS.length}</span>
        {curSec<SECTIONS.length-1
          ?<Btn onClick={()=>goSec(curSec+1)} variant="primary">Далее →</Btn>
          :<Btn onClick={()=>{onSubmit({id:Date.now(),date:new Date().toISOString(),answers,parentName,formType:"anamnez"});setStep("done");}} variant="yellow">✅ Отправить анкету</Btn>
        }
      </div>
    </div>
  );
}

// ─── FamilyForm (отдельная вкладка) ──────────────────────────────────────────
function FamilyForm({ onSubmit }) {
  const [step, setStep] = useState("consent");
  const [curSec, setCurSec] = useState(0);
  const [answers, setAnswers] = useState({});
  const [parentName, setParentName] = useState("");
  const topRef = useRef(null);
  const filled = ALL_FAMILY_FIELDS.filter(f=>answers[f.id]).length;
  const pct = Math.round(filled/FAMILY_TOTAL*100);
  const handleChange = (id,val) => setAnswers(p=>({...p,[id]:val}));
  const goSec = (n) => {setCurSec(n);setTimeout(()=>topRef.current?.scrollIntoView({behavior:"smooth"}),50);};
  if(step==="consent") return <ConsentScreen onAccept={(name)=>{setParentName(name);setStep("form");}}/>;
  if(step==="done") return (
    <div style={{maxWidth:600,margin:"60px auto",padding:"0 20px",textAlign:"center"}}>
      <div style={{background:C.white,borderRadius:20,padding:"60px 40px",boxShadow:"0 4px 24px rgba(42,181,181,0.12)"}}>
        <Logo size={80}/><div style={{fontSize:56,marginBottom:16,marginTop:16}}>✅</div>
        <h2 style={{color:C.dark,fontSize:24,marginBottom:10}}>Анкета отправлена!</h2>
        <p style={{color:C.grayMid,fontSize:15}}>Спасибо! Ваши данные успешно переданы специалисту.</p>
      </div>
    </div>
  );
  const sec = FAMILY_SECTIONS[curSec];
  return (
    <div style={{maxWidth:820,margin:"0 auto",padding:"28px 20px"}}>
      <div ref={topRef}/>
      <div style={{background:C.white,borderRadius:16,boxShadow:"0 2px 12px rgba(0,0,0,0.06)",padding:"20px 24px",marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <span style={{fontWeight:700,color:C.dark,fontSize:14}}>Общий прогресс</span>
          <span style={{color:"#7b5ea7",fontWeight:700,fontSize:14}}>{pct}% · {filled}/{FAMILY_TOTAL}</span>
        </div>
        <ProgressBar pct={pct} color="linear-gradient(90deg,#7b5ea7,#f5c842)" height={8}/>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:14}}>
          {FAMILY_SECTIONS.map((s,i)=>{const sf=s.fields.filter(f=>answers[f.id]).length;const done=sf===s.fields.length;const active=curSec===i;return(<button key={s.id} onClick={()=>goSec(i)} style={{padding:"5px 12px",borderRadius:20,cursor:"pointer",fontSize:12,fontWeight:600,border:`2px solid ${active?s.color:done?s.color+"66":C.grayBorder}`,background:active?s.color:done?s.color+"15":C.grayLight,color:active?"#fff":done?s.color:C.grayMid}}>{s.icon} {sf}/{s.fields.length}</button>);})}
        </div>
      </div>
      <SectionBlock section={sec} answers={answers} onChange={handleChange}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:4}}>
        <Btn onClick={()=>goSec(curSec-1)} variant="ghost" disabled={curSec===0}>← Назад</Btn>
        <span style={{fontSize:13,color:C.grayMid}}>Раздел {curSec+1} из {FAMILY_SECTIONS.length}</span>
        {curSec<FAMILY_SECTIONS.length-1
          ?<Btn onClick={()=>goSec(curSec+1)} variant="primary" style={{background:"#7b5ea7"}}>Далее →</Btn>
          :<Btn onClick={()=>{onSubmit({id:Date.now(),date:new Date().toISOString(),answers,parentName,formType:"family"});setStep("done");}} variant="yellow">✅ Отправить анкету</Btn>
        }
      </div>
    </div>
  );
}

// ─── DocumentsScreen ──────────────────────────────────────────────────────────
function DocumentsScreen({ parentName, childName, onSubmit, prevChecked={}, prevDocs=null }) {
  const [checked, setChecked] = useState(prevChecked||{});
  const [files, setFiles] = useState({});
  const [uploading, setUploading] = useState(false);
  const [comment, setComment] = useState("");
  const toggleCheck = (id) => setChecked(p=>({...p,[id]:!p[id]}));
  const handleFile = (id, e) => {
    const fileList = Array.from(e.target.files);
    if (!fileList.length) return;
    fileList.forEach(f => {
      const r = new FileReader();
      r.onload = (ev) => {
        setFiles(p => ({
          ...p,
          [id]: [...(p[id] || []), { name: f.name, type: f.type, size: f.size, data: ev.target.result }]
        }));
        setChecked(p => ({ ...p, [id]: true }));
      };
      r.readAsDataURL(f);
    });
  };
  const removeFile = (id, idx) => {
    setFiles(p => {
      const arr = (p[id] || []).filter((_, i) => i !== idx);
      if (arr.length > 0) return { ...p, [id]: arr };
      const n = { ...p };
      delete n[id];
      return n;
    });
    setFiles(p => {
      if (!p[id] || p[id].length === 0) setChecked(c => ({ ...c, [id]: false }));
      return p;
    });
  };
  const totalChecked = Object.values(checked).filter(Boolean).length;
  const totalFiles = Object.keys(files).length;
  const allItems = DOCUMENTS.flatMap(d=>d.items);
  const handleSubmit = async () => {
    setUploading(true);
    const docData = { id:Date.now(), date:new Date().toISOString(), parentName, childName, checkedDocs:checked, uploadedFiles:Object.entries(files).map(([id,f])=>({docId:id,fileName:f.name,fileType:f.type,fileSize:f.size,fileData:f.data})), comment, formType:"documents" };
    await onSubmit(docData);
    setUploading(false);
  };
  return (
    <div style={{maxWidth:820,margin:"0 auto",padding:"28px 20px"}}>
      <div style={{background:"linear-gradient(135deg,#1a2a2a,#2a1a1a)",borderRadius:16,padding:"24px 28px",marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:12}}>
          <span style={{fontSize:32}}>📋</span>
          <div>
            <h2 style={{color:C.yellow,fontSize:18,fontWeight:800,margin:0}}>Список необходимых документов</h2>
            <p style={{color:"rgba(255,255,255,0.6)",fontSize:12,margin:"4px 0 0"}}>Перед диагностическим консилиумом</p>
          </div>
        </div>
        <div style={{background:"rgba(255,255,255,0.08)",borderRadius:10,padding:"14px 18px",fontSize:13,color:"rgba(255,255,255,0.8)",lineHeight:1.7}}>
          Все материалы необходимо прислать <b style={{color:C.yellow}}>не позднее чем за 3 суток</b> до начала диагностики. Отметьте галочками что уже есть и прикрепите файлы.
        </div>
      </div>
      {prevDocs && (<div style={{background:"#fff8e1",borderLeft:`4px solid ${C.yellow}`,borderRadius:"0 12px 12px 0",padding:"14px 18px",marginBottom:16,fontSize:13,color:"#555",lineHeight:1.7}}>🔄 <b>Найдена предыдущая отправка</b> от {new Date(prevDocs.date).toLocaleDateString("ru-RU")}. Ранее отмеченные документы уже отмечены. Добавьте недостающие.</div>)}
      {totalChecked>0&&(<div style={{background:C.tealLight,borderRadius:10,padding:"10px 16px",marginBottom:16,fontSize:13,color:C.tealDark,fontWeight:600}}>✅ Отмечено: {totalChecked} из {allItems.length} · Прикреплено файлов: {totalFiles}</div>)}
      {DOCUMENTS.map(docGroup=>(
        <div key={docGroup.id} style={{background:C.white,borderRadius:14,boxShadow:"0 2px 12px rgba(0,0,0,0.06)",marginBottom:16,overflow:"hidden"}}>
          <div style={{padding:"16px 20px",borderBottom:`2px solid ${docGroup.required?"#fee2e2":C.tealLight}`,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:16,fontWeight:700,color:C.dark}}>{docGroup.category}</span>
            {docGroup.required&&<span style={{fontSize:11,fontWeight:700,background:"#fee2e2",color:"#e84545",padding:"2px 8px",borderRadius:10}}>ОБЯЗАТЕЛЬНО</span>}
          </div>
          <div style={{padding:"12px 20px"}}>
            {docGroup.items.map(item=>(
              <div key={item.id} style={{marginBottom:14,paddingBottom:14,borderBottom:`1px solid ${C.grayBorder}`}}>
                <div
                  onClick={()=>{ if(files[item.id]) toggleCheck(item.id); }}
                  style={{display:"flex",alignItems:"flex-start",gap:12,cursor:files[item.id]?"pointer":"not-allowed",marginBottom:8,opacity:files[item.id]?1:0.7}}
                >
                  <div style={{width:22,height:22,borderRadius:5,border:`2px solid ${checked[item.id]?C.teal:files[item.id]?"#aaa":"#ddd"}`,background:checked[item.id]?C.teal:"#fff",flexShrink:0,marginTop:1,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}>
                    {checked[item.id]&&<span style={{color:"#fff",fontSize:13,fontWeight:900}}>✓</span>}
                  </div>
                  <div>
                    <p style={{margin:0,fontSize:14,fontWeight:600,color:checked[item.id]?C.tealDark:C.dark}}>{item.label}</p>
                    {item.note&&<p style={{margin:"2px 0 0",fontSize:12,color:C.grayMid}}>{item.note}</p>}
                    {!files[item.id]&&<p style={{margin:"3px 0 0",fontSize:11,color:"#e84545"}}>⚠️ Сначала прикрепите файл чтобы отметить галочку</p>}
                  </div>
                </div>
                <div style={{marginLeft:34}}>
                  {files[item.id]?(
                    <div style={{display:"flex",alignItems:"center",gap:8,background:C.tealLight,borderRadius:8,padding:"8px 12px"}}>
                      <span style={{fontSize:18}}>📎</span>
                      <span style={{fontSize:13,color:C.tealDark,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{files[item.id].name}</span>
                      <button onClick={()=>removeFile(item.id)} style={{background:"none",border:"none",color:"#e84545",cursor:"pointer",fontSize:18,padding:0}}>×</button>
                    </div>
                  ):(
                    <label style={{display:"inline-flex",alignItems:"center",gap:6,cursor:"pointer",padding:"6px 14px",background:C.grayLight,borderRadius:8,border:`1px dashed ${C.grayBorder}`,fontSize:12,color:C.grayMid}}>
                      <span>📎</span> Прикрепить файл или фото
                      <input type="file" accept="image/*,.pdf,.doc,.docx" style={{display:"none"}} onChange={e=>handleFile(item.id,e)}/>
                    </label>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div style={{background:C.white,borderRadius:14,boxShadow:"0 2px 12px rgba(0,0,0,0.06)",padding:"20px",marginBottom:20}}>
        <p style={{fontSize:14,fontWeight:600,color:C.dark,marginBottom:8}}>💬 Дополнительный комментарий</p>
        <textarea rows={3} value={comment} onChange={e=>setComment(e.target.value)} placeholder="Например: анализ ЭЭГ сдаём на следующей неделе..." style={{width:"100%",border:`1.5px solid ${C.grayBorder}`,borderRadius:8,padding:"10px 14px",fontSize:14,color:C.dark,outline:"none",resize:"vertical",boxSizing:"border-box",background:"#fafcfc",fontFamily:"inherit"}}/>
      </div>
      <div style={{background:"linear-gradient(135deg,#1a3a2a,#1a2a1a)",borderRadius:14,padding:"24px 28px",textAlign:"center"}}>
        <Btn onClick={handleSubmit} variant="yellow" disabled={uploading} style={{fontSize:15,padding:"14px 36px"}}>
          {uploading?"⏳ Отправляем...":`✅ Отправить документы (${totalChecked} отмечено, ${totalFiles} файлов)`}
        </Btn>
      </div>
    </div>
  );
}


// ─── Admin login ──────────────────────────────────────────────────────────────
function AdminLogin({ onLogin }) {
  const [pw, setPw] = useState(""); 
  const [err, setErr] = useState(false);
  const check = () => pw === "3211" ? onLogin() : setErr(true);
  return (
    <div style={{ maxWidth:420, margin:"80px auto", padding:"0 20px" }}>
      <div style={{ background:C.white, borderRadius:20, boxShadow:"0 4px 24px rgba(42,181,181,0.12)", padding:"48px 40px", textAlign:"center" }}>
        <Logo size={64}/>
        <h2 style={{ fontSize:22, color:C.dark, margin:"20px 0 24px" }}>Вход для администратора</h2>
        <input type="password" style={{ width:"100%", border:`1.5px solid ${C.grayBorder}`, borderRadius:8, padding:"10px 14px", fontSize:14, textAlign:"center", outline:"none", marginBottom:12, boxSizing:"border-box", background:"#fafcfc", color:C.dark }}
          placeholder="Введите пароль" value={pw}
          onChange={e => { setPw(e.target.value); setErr(false); }}
          onKeyDown={e => e.key === "Enter" && check()} />
        {err && <p style={{ color:"#e05050", fontSize:13, margin:"0 0 12px" }}>Неверный пароль</p>}
        <button onClick={check} style={{ width:"100%", padding:"10px 24px", borderRadius:8, border:"none", cursor:"pointer", fontSize:14, fontWeight:700, background:C.teal, color:"#fff" }}>Войти</button>
      </div>
    </div>
  );
}

// ─── Admin panel ──────────────────────────────────────────────────────────────
const DELETE_PASSWORD = "3222";

function AdminPanel({ submissions = [], loading = false, onRefresh, onDelete }) {
  const [sel, setSel] = useState(null);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletePw, setDeletePw] = useState("");
  const [deleteErr, setDeleteErr] = useState(false);
  const topRef = useRef(null);

  const safeSubs = Array.isArray(submissions) ? submissions : [];
  const filteredSubs = search.trim()
    ? safeSubs.filter(s => {
        const n = (s.answers?.s0_1 || s.answers?.f0_1 || "").toLowerCase();
        const p = (s.parent_name || "").toLowerCase();
        return n.includes(search.toLowerCase()) || p.includes(search.toLowerCase());
      })
    : safeSubs;

  const doExport = (sub) => { try { exportToWord(sub); } catch(e) {} };
  const confirmDelete = (sub) => { setDeleteTarget(sub); setDeletePw(""); setDeleteErr(false); };
  const executeDelete = () => {
    if (deletePw === DELETE_PASSWORD) { onDelete(deleteTarget); setDeleteTarget(null); if (sel?.id === deleteTarget.id) setSel(null); }
    else setDeleteErr(true);
  };

  const DelModal = deleteTarget ? (
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.6)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:"#fff", borderRadius:16, padding:"36px 32px", maxWidth:400, width:"100%", textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:12 }}>🗑️</div>
        <h3 style={{ fontSize:18, color:"#1a2a2a", marginBottom:8 }}>Удалить анкету?</h3>
        <p style={{ fontSize:13, color:"#666", marginBottom:20 }}><b>{deleteTarget.answers?.s0_1 || deleteTarget.answers?.f0_1 || "Без имени"}</b><br/>Это действие нельзя отменить.</p>
        <input type="password" placeholder="Пароль для удаления" value={deletePw}
          onChange={e => { setDeletePw(e.target.value); setDeleteErr(false); }}
          onKeyDown={e => e.key === "Enter" && executeDelete()}
          style={{ width:"100%", border:`1.5px solid ${deleteErr?"#e05050":"#e2e8f0"}`, borderRadius:8, padding:"10px 14px", fontSize:14, textAlign:"center", outline:"none", marginBottom:8, boxSizing:"border-box" }} autoFocus/>
        {deleteErr && <p style={{ color:"#e05050", fontSize:13, margin:"0 0 12px" }}>Неверный пароль</p>}
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={() => setDeleteTarget(null)} style={{ flex:1, padding:"10px", borderRadius:8, border:"1.5px solid #e2e8f0", background:"#f4f6f8", cursor:"pointer", fontSize:14, fontWeight:600 }}>Отмена</button>
          <button onClick={executeDelete} style={{ flex:1, padding:"10px", borderRadius:8, border:"none", background:"#e84545", color:"#fff", cursor:"pointer", fontSize:14, fontWeight:700 }}>Удалить</button>
        </div>
      </div>
    </div>
  ) : null;

  if (sel) return (
    <div style={{ maxWidth:820, margin:"0 auto", padding:"28px 20px" }}>
      {DelModal}<div ref={topRef}/>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, gap:10, flexWrap:"wrap" }}>
        <button onClick={() => setSel(null)} style={{ padding:"10px 24px", borderRadius:8, border:"none", cursor:"pointer", fontSize:14, fontWeight:700, background:C.grayLight, color:C.gray }}>← Все анкеты</button>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={() => doExport(sel)} style={{ padding:"10px 24px", borderRadius:8, border:"none", cursor:"pointer", fontSize:14, fontWeight:700, background:C.yellow, color:C.dark }}>📄 Печать</button>
          <button onClick={() => confirmDelete(sel)} style={{ padding:"10px 24px", borderRadius:8, border:"none", cursor:"pointer", fontSize:14, fontWeight:700, background:"#fee2e2", color:"#e84545" }}>🗑️ Удалить</button>
        </div>
      </div>
      <div style={{ background:C.white, borderRadius:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", padding:"28px 32px" }}>
        <h2 style={{ fontSize:20, color:C.dark, marginBottom:4 }}>{sel.answers?.s0_1 || sel.answers?.f0_1 || "—"}</h2>
        <p style={{ fontSize:13, color:C.grayMid, marginBottom:4 }}>Родитель: <b style={{color:C.dark}}>{sel.parent_name || "—"}</b></p>
        <p style={{ fontSize:13, color:C.grayMid, marginBottom:4 }}>Тип: <b style={{color:C.teal}}>{sel.form_type === "family" ? "🧬 Семейный фон" : sel.form_type === "documents" ? "📋 Документы" : "📋 М.И. Лынской"}</b></p>
        <p style={{ fontSize:13, color:C.grayMid, marginBottom:20 }}>Дата: {sel.date ? new Date(sel.date).toLocaleString("ru-RU") : "—"}</p>
        {sel.form_type === "documents" ? (
          <div>
            {(() => {
              const checked = (() => { try { return JSON.parse(sel.answers?.checkedDocs || "{}"); } catch(e) { return {}; } })();
              const fileNames = (() => { try { return JSON.parse(sel.answers?.fileNames || "[]"); } catch(e) { return []; } })();
              const fileData = (() => { try { return JSON.parse(sel.answers?.fileData || "[]"); } catch(e) { return []; } })();
              return DOCUMENTS.map(group => (
                <div key={group.id} style={{ marginBottom:16 }}>
                  <p style={{ fontSize:13, fontWeight:700, color:C.dark, marginBottom:8, borderBottom:`2px solid ${group.required?"#fee2e2":C.tealLight}`, paddingBottom:6 }}>
                    {group.category} {group.required && <span style={{fontSize:11,color:"#e84545"}}>(ОБЯЗАТЕЛЬНО)</span>}
                  </p>
                  {group.items.map(item => {
                    const isChecked = checked[item.id];
                    const file = fileNames.find(f => f.docId === item.id);
                    const fd = fileData.find(f => f.docId === item.id);
                    return (
                      <div key={item.id} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8, padding:"8px 12px", background:isChecked?"#e8f8f8":"#fafafa", borderRadius:8 }}>
                        <span>{isChecked ? "✅" : "⬜"}</span>
                        <span style={{ flex:1, fontSize:13, color:isChecked?C.tealDark:C.grayMid }}>{item.label}</span>
                        {file && fd && <a href={fd.data} download={file.fileName} style={{ fontSize:12, color:C.teal, fontWeight:600, textDecoration:"none", background:C.tealLight, padding:"4px 10px", borderRadius:8 }}>📎 {file.fileName}</a>}
                      </div>
                    );
                  })}
                </div>
              ));
            })()}
            {sel.answers?.comment && <p style={{ fontSize:13, color:C.gray, marginTop:12 }}>💬 {sel.answers.comment}</p>}
          </div>
        ) : (
          (sel.form_type === "family" ? FAMILY_SECTIONS : SECTIONS).map(sec => (
            <div key={sec.id} style={{ marginBottom:24 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12, paddingBottom:8, borderBottom:`2px solid ${sec.color}33` }}>
                <span style={{ fontSize:18 }}>{sec.icon}</span>
                <span style={{ fontSize:15, fontWeight:700, color:C.dark }}>{sec.title}</span>
              </div>
              {sec.fields.map((f, i) => (
                <div key={f.id} style={{ marginBottom:12, paddingBottom:12, borderBottom:`1px solid ${C.grayBorder}` }}>
                  <p style={{ fontSize:12, color:"#aaa", margin:"0 0 3px" }}>{i+1}. {f.label}</p>
                  <p style={{ fontSize:13, color:sel.answers?.[f.id]?C.dark:"#ccc", margin:0, background:C.grayLight, padding:"7px 10px", borderRadius:6, whiteSpace:"pre-wrap" }}>
                    {sel.answers?.[f.id] || "Нет ответа"}
                  </p>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth:820, margin:"0 auto", padding:"28px 20px" }}>
      {DelModal}
      <div style={{ background:C.white, borderRadius:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", padding:"28px 32px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20 }}>
          <Logo size={44}/>
          <div>
            <h2 style={{ margin:0, fontSize:20, color:C.dark }}>Панель администратора</h2>
            <p style={{ margin:"2px 0 0", fontSize:13, color:C.grayMid }}>Всего анкет: {safeSubs.length}</p>
          </div>
          <button onClick={onRefresh} disabled={loading} style={{ marginLeft:"auto", padding:"8px 16px", borderRadius:8, border:"none", cursor:"pointer", fontSize:12, fontWeight:700, background:C.grayLight, color:C.gray }}>
            {loading ? "⏳ Загружаем..." : "↻ Обновить"}
          </button>
        </div>
        <div style={{ position:"relative", marginBottom:16 }}>
          <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:15, color:C.grayMid, pointerEvents:"none" }}>🔍</span>
          <input type="text" placeholder="Поиск по фамилии..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width:"100%", border:`1.5px solid ${search?C.teal:C.grayBorder}`, borderRadius:10, padding:"11px 14px 11px 42px", fontSize:14, color:C.dark, outline:"none", boxSizing:"border-box", background:"#fafcfc", fontFamily:"inherit" }}/>
          {search && <button onClick={() => setSearch("")} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:20, color:C.grayMid, padding:0 }}>×</button>}
        </div>
        {loading && <div style={{ textAlign:"center", padding:"40px 0", color:C.grayMid }}><div style={{ fontSize:32, marginBottom:12 }}>⏳</div><p>Загружаем анкеты...</p></div>}
        {!loading && safeSubs.length === 0 && <div style={{ textAlign:"center", padding:"48px 0", color:"#bbb" }}><div style={{ fontSize:48, marginBottom:12 }}>📋</div><p>Пока нет анкет</p><p style={{ fontSize:12, marginTop:8 }}>Нажмите «↻ Обновить»</p></div>}
        {!loading && safeSubs.length > 0 && filteredSubs.length === 0 && <div style={{ textAlign:"center", padding:"40px 0", color:"#bbb" }}><div style={{ fontSize:40, marginBottom:12 }}>🔍</div><p>Ничего не найдено</p></div>}
        {!loading && filteredSubs.map((sub, idx) => {
          const name = sub.answers?.s0_1 || sub.answers?.f0_1 || "Без имени";
          const city = sub.answers?.s0_4 || sub.answers?.f0_4 || "";
          const dateStr = sub.date ? new Date(sub.date).toLocaleDateString("ru-RU") : "—";
          const badge = sub.form_type === "family" ? { label:"🧬 Семейный фон", bg:"#7b5ea722", color:"#7b5ea7" }
            : sub.form_type === "documents" ? { label:"📋 Документы", bg:"#fee2e2", color:"#e84545" }
            : { label:"📋 М.И. Лынской", bg:C.tealLight, color:C.tealDark };
          return (
            <div key={sub.id || idx} style={{ background:C.grayLight, borderRadius:12, padding:"16px 20px", marginBottom:12, border:`1px solid ${C.grayBorder}` }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2, flexWrap:"wrap" }}>
                    <p style={{ margin:0, fontWeight:700, fontSize:15, color:C.dark }}>{name}</p>
                    <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:10, background:badge.bg, color:badge.color }}>{badge.label}</span>
                  </div>
                  <p style={{ margin:"0 0 2px", fontSize:12, color:C.grayMid }}>Родитель: {sub.parent_name || "—"}</p>
                  <p style={{ margin:0, fontSize:12, color:C.grayMid }}>{city}{city?" · ":""}{dateStr}</p>
                </div>
                <div style={{ display:"flex", gap:8, flexShrink:0, flexWrap:"wrap" }}>
                  <button onClick={() => { setSel(sub); topRef?.current?.scrollIntoView(); }} style={{ padding:"8px 16px", borderRadius:8, border:"none", cursor:"pointer", fontSize:13, fontWeight:700, background:C.grayLight, color:C.gray }}>👁 Просмотр</button>
                  <button onClick={() => doExport(sub)} style={{ padding:"8px 16px", borderRadius:8, border:"none", cursor:"pointer", fontSize:13, fontWeight:700, background:C.yellow, color:C.dark }}>📄 PDF</button>
                  <button onClick={() => confirmDelete(sub)} style={{ padding:"8px 16px", borderRadius:8, border:"none", cursor:"pointer", fontSize:13, fontWeight:700, background:"#fee2e2", color:"#e84545" }}>🗑️</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── DocsOnlyForm ─────────────────────────────────────────────────────────────
async function loadPreviousDocs(childName) {
  try {
    const result = await apiCall("GET", { child_name: childName.trim() });
    if (!result.data) return null;
    const row = result.data;
    return {
      id: row.id, date: row.date,
      answers: typeof row.answers === "string" ? JSON.parse(row.answers) : (row.answers || {}),
      parent_name: row.parent_name || "",
    };
  } catch(e) { return null; }
}

function DocsOnlyForm({ onSubmit }) {
  const [step, setStep] = useState("info");
  const [childName, setChildName] = useState("");
  const [parentName, setParentName] = useState("");
  const [searching, setSearching] = useState(false);
  const [prevDocs, setPrevDocs] = useState(null);
  const [prevChecked, setPrevChecked] = useState({});
  const [done, setDone] = useState(false);

  const handleSearch = async () => {
    if (!childName.trim() || !parentName.trim()) return;
    setSearching(true);
    const prev = await loadPreviousDocs(childName);
    if (prev) {
      try { setPrevChecked(JSON.parse(prev.answers?.checkedDocs || "{}")); setPrevDocs(prev); } catch(e) {}
    }
    setSearching(false);
    setStep("docs");
  };

  if (done) return (
    <div style={{ maxWidth:600, margin:"60px auto", padding:"0 20px", textAlign:"center" }}>
      <div style={{ background:C.white, borderRadius:20, padding:"60px 40px", boxShadow:"0 4px 24px rgba(42,181,181,0.12)" }}>
        <Logo size={80}/><div style={{ fontSize:56, marginBottom:16, marginTop:16 }}>📎</div>
        <h2 style={{ color:C.dark, fontSize:24, marginBottom:10 }}>Документы отправлены!</h2>
        <p style={{ color:C.grayMid, fontSize:15 }}>Спасибо! Администратор получил ваши документы.</p>
      </div>
    </div>
  );

  if (step === "docs") return (
    <DocumentsScreen parentName={parentName} childName={childName} prevChecked={prevChecked} prevDocs={prevDocs}
      onSubmit={async (docData) => { await onSubmit({ ...docData, answers: { ...docData.answers, s0_1: childName } }); setDone(true); }}/>
  );

  return (
    <div style={{ maxWidth:640, margin:"0 auto", padding:"40px 20px" }}>
      <div style={{ background:C.white, borderRadius:20, boxShadow:"0 4px 24px rgba(42,181,181,0.12)", overflow:"hidden" }}>
        <div style={{ background:`linear-gradient(135deg,${C.dark},#1a3a2a)`, padding:"28px 32px", display:"flex", alignItems:"center", gap:16 }}>
          <Logo size={52}/>
          <div>
            <h1 style={{ color:C.yellow, fontSize:18, fontWeight:800, margin:"0 0 4px" }}>Отправка документов</h1>
            <p style={{ color:C.teal, fontSize:12, margin:0 }}>Перед диагностическим консилиумом</p>
          </div>
        </div>
        <div style={{ padding:"28px 32px" }}>
          <div style={{ background:"#fff8e1", borderLeft:`4px solid ${C.yellow}`, borderRadius:"0 10px 10px 0", padding:"14px 18px", marginBottom:24, fontSize:13, color:"#555", lineHeight:1.7 }}>
            ⏰ <b>Важно:</b> все документы не позднее <b>3 суток</b> до диагностики.<br/>
            Если уже отправляли часть — введите ту же фамилию и мы покажем что уже есть.
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontSize:13, fontWeight:600, color:C.dark, marginBottom:6 }}>Фамилия и имя ребёнка <span style={{color:"#e84545"}}>*</span></label>
            <input type="text" value={childName} onChange={e=>setChildName(e.target.value)} placeholder="Например: Иванов Артём"
              style={{ width:"100%", border:`1.5px solid ${childName?C.teal:C.grayBorder}`, borderRadius:8, padding:"10px 14px", fontSize:14, color:C.dark, outline:"none", boxSizing:"border-box", background:"#fafcfc", fontFamily:"inherit" }}/>
          </div>
          <div style={{ marginBottom:28 }}>
            <label style={{ display:"block", fontSize:13, fontWeight:600, color:C.dark, marginBottom:6 }}>ФИО родителя <span style={{color:"#e84545"}}>*</span></label>
            <input type="text" value={parentName} onChange={e=>setParentName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSearch()} placeholder="Например: Иванова Мария Петровна"
              style={{ width:"100%", border:`1.5px solid ${parentName?C.teal:C.grayBorder}`, borderRadius:8, padding:"10px 14px", fontSize:14, color:C.dark, outline:"none", boxSizing:"border-box", background:"#fafcfc", fontFamily:"inherit" }}/>
          </div>
          <button onClick={handleSearch} disabled={!childName.trim()||!parentName.trim()||searching}
            style={{ padding:"13px 32px", borderRadius:8, border:"none", cursor:"pointer", fontSize:15, fontWeight:700, background:C.teal, color:"#fff", opacity:childName.trim()&&parentName.trim()?1:0.4 }}>
            {searching ? "⏳ Проверяем..." : "Перейти к документам →"}
          </button>
        </div>
      </div>
    </div>
  );
}

async function apiCall(method, params = {}) {
  const url = new URL("/api/save", window.location.origin);
  if (method === "GET" || method === "DELETE") {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString(), {
    method,
    headers: { "Content-Type": "application/json" },
    body: method === "POST" ? JSON.stringify(params) : undefined,
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

async function sendToSheets(submission) {
  try {
    let answers = submission.answers || {};
    if (submission.formType === "documents") {
      answers = {
        checkedDocs: JSON.stringify(submission.checkedDocs || {}),
        comment: submission.comment || "",
        fileNames: JSON.stringify((submission.uploadedFiles || []).map(f => ({ docId: f.docId, fileName: f.fileName, fileType: f.fileType }))),
        fileData: JSON.stringify((submission.uploadedFiles || []).map(f => ({ docId: f.docId, data: f.fileData }))),
        s0_1: submission.answers?.s0_1 || "",
      };
    }
    await apiCall("POST", {
      date: submission.date,
      answers,
      parent_name: submission.parentName || "",
      form_type: submission.formType || "anamnez",
    });
    return true;
  } catch(e) {
    console.error("Save error:", e);
    return false;
  }
}

async function loadFromSheets() {
  try {
    const result = await apiCall("GET");
    return (result.data || []).map(row => ({
      id: row.id,
      date: row.date,
      answers: typeof row.answers === "string" ? JSON.parse(row.answers) : (row.answers || {}),
      parent_name: row.parent_name || "",
      form_type: row.form_type || "anamnez",
    }));
  } catch(e) {
    console.error("Load error:", e);
    return [];
  }
}

// ─── App root ─────────────────────────────────────────────────────────────────
function AppInner() {
  const [view, setView] = React.useState("client");
  const [auth, setAuth] = React.useState(false);
  const [submissions, setSubmissions] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState(null);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const subs = await loadFromSheets();
      setSubmissions(Array.isArray(subs) ? subs : []);
    } catch(e) { setSubmissions([]); }
    setLoading(false);
  };

  const handleSubmit = async (sub) => {
    setSaveStatus("saving");
    try {
      const ok = await sendToSheets(sub);
      setSaveStatus(ok ? "ok" : "error");
    } catch(e) { setSaveStatus("error"); }
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleDelete = async (sub) => {
    try {
      await apiCall("DELETE", { id: sub.id });
      setSubmissions(prev => prev.filter(s => s.id !== sub.id));
    } catch(e) { console.error("Delete error:", e); }
  };

  return (
    <div style={{ minHeight:"100vh", background:C.grayLight, fontFamily:"'Segoe UI',Arial,sans-serif" }}>
      <Header view={view} setView={setView} auth={auth} onLogout={() => { setAuth(false); setView("client"); }}/>
      {saveStatus === "saving" && <div style={{ background:"#f5c842", color:"#1a2a2a", textAlign:"center", padding:"10px", fontSize:13, fontWeight:700 }}>⏳ Сохраняем анкету...</div>}
      {saveStatus === "ok" && <div style={{ background:"#27ae60", color:"#fff", textAlign:"center", padding:"10px", fontSize:13, fontWeight:700 }}>✅ Анкета успешно сохранена!</div>}
      {saveStatus === "error" && <div style={{ background:"#e84545", color:"#fff", textAlign:"center", padding:"10px", fontSize:13, fontWeight:700 }}>⚠️ Ошибка сохранения. Проверьте интернет.</div>}
      {view === "client" && <ClientForm onSubmit={handleSubmit}/>}
      {view === "family" && <FamilyForm onSubmit={handleSubmit}/>}
      {view === "docs" && <DocsOnlyForm onSubmit={handleSubmit}/>}
      {view === "adminLogin" && <AdminLogin onLogin={() => { setAuth(true); setView("admin"); }}/>}
      {view === "admin" && auth && <AdminPanel submissions={submissions} loading={loading} onRefresh={loadSubmissions} onDelete={handleDelete}/>}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppInner />
    </ErrorBoundary>
  );
}{/* Загрузка файлов */}
                <div style={{marginLeft:34}}>
                  {(files[item.id]||[]).map((f,fi)=>(
                    <div key={fi} style={{display:"flex",alignItems:"center",gap:8,background:C.tealLight,borderRadius:8,padding:"7px 12px",marginBottom:6}}>
                      <span style={{fontSize:16}}>📎</span>
                      <span style={{fontSize:12,color:C.tealDark,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.name}</span>
                      <button onClick={()=>removeFile(item.id,fi)} style={{background:"none",border:"none",color:"#e84545",cursor:"pointer",fontSize:18,padding:0,flexShrink:0}}>×</button>
                    </div>
                  ))}
                  <label style={{display:"inline-flex",alignItems:"center",gap:6,cursor:"pointer",padding:"6px 14px",background:C.grayLight,borderRadius:8,border:`1px dashed ${C.grayBorder}`,fontSize:12,color:C.grayMid}}>
                    <span>📎</span> {(files[item.id]||[]).length>0?"Добавить ещё файл":"Прикрепить файл или фото"}
                    <input type="file" accept="image/*,.pdf,.doc,.docx" multiple style={{display:"none"}} onChange={e=>handleFile(item.id,e)}/>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div style={{background:C.white,borderRadius:14,boxShadow:"0 2px 12px rgba(0,0,0,0.06)",padding:"20px",marginBottom:20}}>
        <p style={{fontSize:14,fontWeight:600,color:C.dark,marginBottom:8}}>💬 Дополнительный комментарий</p>
        <textarea rows={3} value={comment} onChange={e=>setComment(e.target.value)} placeholder="Например: анализ ЭЭГ сдаём на следующей неделе..." style={{width:"100%",border:`1.5px solid ${C.grayBorder}`,borderRadius:8,padding:"10px 14px",fontSize:14,color:C.dark,outline:"none",resize:"vertical",boxSizing:"border-box",background:"#fafcfc",fontFamily:"inherit"}}/>
      </div>
      <div style={{background:"linear-gradient(135deg,#1a3a2a,#1a2a1a)",borderRadius:14,padding:"24px 28px",textAlign:"center"}}>
        <Btn onClick={handleSubmit} variant="yellow" disabled={uploading} style={{fontSize:15,padding:"14px 36px"}}>
          {uploading?"⏳ Отправляем...":`✅ Отправить документы (${totalChecked} отмечено, ${totalFiles} файлов)`}
        </Btn>
      </div>
    </div>
  );
}


// ─── Admin login ──────────────────────────────────────────────────────────────
function AdminLogin({ onLogin }) {
  const [pw, setPw] = useState(""); 
  const [err, setErr] = useState(false);
  const check = () => pw === "3211" ? onLogin() : setErr(true);
  return (
    <div style={{ maxWidth:420, margin:"80px auto", padding:"0 20px" }}>
      <div style={{ background:C.white, borderRadius:20, boxShadow:"0 4px 24px rgba(42,181,181,0.12)", padding:"48px 40px", textAlign:"center" }}>
        <Logo size={64}/>
        <h2 style={{ fontSize:22, color:C.dark, margin:"20px 0 24px" }}>Вход для администратора</h2>
        <input type="password" style={{ width:"100%", border:`1.5px solid ${C.grayBorder}`, borderRadius:8, padding:"10px 14px", fontSize:14, textAlign:"center", outline:"none", marginBottom:12, boxSizing:"border-box", background:"#fafcfc", color:C.dark }}
          placeholder="Введите пароль" value={pw}
          onChange={e => { setPw(e.target.value); setErr(false); }}
          onKeyDown={e => e.key === "Enter" && check()} />
        {err && <p style={{ color:"#e05050", fontSize:13, margin:"0 0 12px" }}>Неверный пароль</p>}
        <button onClick={check} style={{ width:"100%", padding:"10px 24px", borderRadius:8, border:"none", cursor:"pointer", fontSize:14, fontWeight:700, background:C.teal, color:"#fff" }}>Войти</button>
      </div>
    </div>
  );
}

// ─── Admin panel ──────────────────────────────────────────────────────────────
const DELETE_PASSWORD = "3222";

function AdminPanel({ submissions = [], loading = false, onRefresh, onDelete }) {
  const [sel, setSel] = useState(null);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletePw, setDeletePw] = useState("");
  const [deleteErr, setDeleteErr] = useState(false);
  const topRef = useRef(null);

  const safeSubs = Array.isArray(submissions) ? submissions : [];
  const filteredSubs = search.trim()
    ? safeSubs.filter(s => {
        const n = (s.answers?.s0_1 || s.answers?.f0_1 || "").toLowerCase();
        const p = (s.parent_name || "").toLowerCase();
        return n.includes(search.toLowerCase()) || p.includes(search.toLowerCase());
      })
    : safeSubs;

  const doExport = (sub) => { try { exportToWord(sub); } catch(e) {} };
  const confirmDelete = (sub) => { setDeleteTarget(sub); setDeletePw(""); setDeleteErr(false); };
  const executeDelete = () => {
    if (deletePw === DELETE_PASSWORD) { onDelete(deleteTarget); setDeleteTarget(null); if (sel?.id === deleteTarget.id) setSel(null); }
    else setDeleteErr(true);
  };

  const DelModal = deleteTarget ? (
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.6)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:"#fff", borderRadius:16, padding:"36px 32px", maxWidth:400, width:"100%", textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:12 }}>🗑️</div>
        <h3 style={{ fontSize:18, color:"#1a2a2a", marginBottom:8 }}>Удалить анкету?</h3>
        <p style={{ fontSize:13, color:"#666", marginBottom:20 }}><b>{deleteTarget.answers?.s0_1 || deleteTarget.answers?.f0_1 || "Без имени"}</b><br/>Это действие нельзя отменить.</p>
        <input type="password" placeholder="Пароль для удаления" value={deletePw}
          onChange={e => { setDeletePw(e.target.value); setDeleteErr(false); }}
          onKeyDown={e => e.key === "Enter" && executeDelete()}
          style={{ width:"100%", border:`1.5px solid ${deleteErr?"#e05050":"#e2e8f0"}`, borderRadius:8, padding:"10px 14px", fontSize:14, textAlign:"center", outline:"none", marginBottom:8, boxSizing:"border-box" }} autoFocus/>
        {deleteErr && <p style={{ color:"#e05050", fontSize:13, margin:"0 0 12px" }}>Неверный пароль</p>}
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={() => setDeleteTarget(null)} style={{ flex:1, padding:"10px", borderRadius:8, border:"1.5px solid #e2e8f0", background:"#f4f6f8", cursor:"pointer", fontSize:14, fontWeight:600 }}>Отмена</button>
          <button onClick={executeDelete} style={{ flex:1, padding:"10px", borderRadius:8, border:"none", background:"#e84545", color:"#fff", cursor:"pointer", fontSize:14, fontWeight:700 }}>Удалить</button>
        </div>
      </div>
    </div>
  ) : null;

  if (sel) return (
    <div style={{ maxWidth:820, margin:"0 auto", padding:"28px 20px" }}>
      {DelModal}<div ref={topRef}/>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, gap:10, flexWrap:"wrap" }}>
        <button onClick={() => setSel(null)} style={{ padding:"10px 24px", borderRadius:8, border:"none", cursor:"pointer", fontSize:14, fontWeight:700, background:C.grayLight, color:C.gray }}>← Все анкеты</button>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={() => doExport(sel)} style={{ padding:"10px 24px", borderRadius:8, border:"none", cursor:"pointer", fontSize:14, fontWeight:700, background:C.yellow, color:C.dark }}>📄 Печать</button>
          <button onClick={() => confirmDelete(sel)} style={{ padding:"10px 24px", borderRadius:8, border:"none", cursor:"pointer", fontSize:14, fontWeight:700, background:"#fee2e2", color:"#e84545" }}>🗑️ Удалить</button>
        </div>
      </div>
      <div style={{ background:C.white, borderRadius:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", padding:"28px 32px" }}>
        <h2 style={{ fontSize:20, color:C.dark, marginBottom:4 }}>{sel.answers?.s0_1 || sel.answers?.f0_1 || "—"}</h2>
        <p style={{ fontSize:13, color:C.grayMid, marginBottom:4 }}>Родитель: <b style={{color:C.dark}}>{sel.parent_name || "—"}</b></p>
        <p style={{ fontSize:13, color:C.grayMid, marginBottom:4 }}>Тип: <b style={{color:C.teal}}>{sel.form_type === "family" ? "🧬 Семейный фон" : sel.form_type === "documents" ? "📋 Документы" : "📋 М.И. Лынской"}</b></p>
        <p style={{ fontSize:13, color:C.grayMid, marginBottom:20 }}>Дата: {sel.date ? new Date(sel.date).toLocaleString("ru-RU") : "—"}</p>
        {sel.form_type === "documents" ? (
          <div>
            {(() => {
              const checked = (() => { try { return JSON.parse(sel.answers?.checkedDocs || "{}"); } catch(e) { return {}; } })();
              const fileNames = (() => { try { return JSON.parse(sel.answers?.fileNames || "[]"); } catch(e) { return []; } })();
              const fileData = (() => { try { return JSON.parse(sel.answers?.fileData || "[]"); } catch(e) { return []; } })();
              return DOCUMENTS.map(group => (
                <div key={group.id} style={{ marginBottom:16 }}>
                  <p style={{ fontSize:13, fontWeight:700, color:C.dark, marginBottom:8, borderBottom:`2px solid ${group.required?"#fee2e2":C.tealLight}`, paddingBottom:6 }}>
                    {group.category} {group.required && <span style={{fontSize:11,color:"#e84545"}}>(ОБЯЗАТЕЛЬНО)</span>}
                  </p>
                  {group.items.map(item => {
                    const isChecked = checked[item.id];
                    const file = fileNames.find(f => f.docId === item.id);
                    const fd = fileData.find(f => f.docId === item.id);
                    return (
                      <div key={item.id} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8, padding:"8px 12px", background:isChecked?"#e8f8f8":"#fafafa", borderRadius:8 }}>
                        <span>{isChecked ? "✅" : "⬜"}</span>
                        <span style={{ flex:1, fontSize:13, color:isChecked?C.tealDark:C.grayMid }}>{item.label}</span>
                        {file && fd && <a href={fd.data} download={file.fileName} style={{ fontSize:12, color:C.teal, fontWeight:600, textDecoration:"none", background:C.tealLight, padding:"4px 10px", borderRadius:8 }}>📎 {file.fileName}</a>}
                      </div>
                    );
                  })}
                </div>
              ));
            })()}
            {sel.answers?.comment && <p style={{ fontSize:13, color:C.gray, marginTop:12 }}>💬 {sel.answers.comment}</p>}
          </div>
        ) : (
          (sel.form_type === "family" ? FAMILY_SECTIONS : SECTIONS).map(sec => (
            <div key={sec.id} style={{ marginBottom:24 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12, paddingBottom:8, borderBottom:`2px solid ${sec.color}33` }}>
                <span style={{ fontSize:18 }}>{sec.icon}</span>
                <span style={{ fontSize:15, fontWeight:700, color:C.dark }}>{sec.title}</span>
              </div>
              {sec.fields.map((f, i) => (
                <div key={f.id} style={{ marginBottom:12, paddingBottom:12, borderBottom:`1px solid ${C.grayBorder}` }}>
                  <p style={{ fontSize:12, color:"#aaa", margin:"0 0 3px" }}>{i+1}. {f.label}</p>
                  <p style={{ fontSize:13, color:sel.answers?.[f.id]?C.dark:"#ccc", margin:0, background:C.grayLight, padding:"7px 10px", borderRadius:6, whiteSpace:"pre-wrap" }}>
                    {sel.answers?.[f.id] || "Нет ответа"}
                  </p>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth:820, margin:"0 auto", padding:"28px 20px" }}>
      {DelModal}
      <div style={{ background:C.white, borderRadius:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", padding:"28px 32px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20 }}>
          <Logo size={44}/>
          <div>
            <h2 style={{ margin:0, fontSize:20, color:C.dark }}>Панель администратора</h2>
            <p style={{ margin:"2px 0 0", fontSize:13, color:C.grayMid }}>Всего анкет: {safeSubs.length}</p>
          </div>
          <button onClick={onRefresh} disabled={loading} style={{ marginLeft:"auto", padding:"8px 16px", borderRadius:8, border:"none", cursor:"pointer", fontSize:12, fontWeight:700, background:C.grayLight, color:C.gray }}>
            {loading ? "⏳ Загружаем..." : "↻ Обновить"}
          </button>
        </div>
        <div style={{ position:"relative", marginBottom:16 }}>
          <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:15, color:C.grayMid, pointerEvents:"none" }}>🔍</span>
          <input type="text" placeholder="Поиск по фамилии..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width:"100%", border:`1.5px solid ${search?C.teal:C.grayBorder}`, borderRadius:10, padding:"11px 14px 11px 42px", fontSize:14, color:C.dark, outline:"none", boxSizing:"border-box", background:"#fafcfc", fontFamily:"inherit" }}/>
          {search && <button onClick={() => setSearch("")} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:20, color:C.grayMid, padding:0 }}>×</button>}
        </div>
        {loading && <div style={{ textAlign:"center", padding:"40px 0", color:C.grayMid }}><div style={{ fontSize:32, marginBottom:12 }}>⏳</div><p>Загружаем анкеты...</p></div>}
        {!loading && safeSubs.length === 0 && <div style={{ textAlign:"center", padding:"48px 0", color:"#bbb" }}><div style={{ fontSize:48, marginBottom:12 }}>📋</div><p>Пока нет анкет</p><p style={{ fontSize:12, marginTop:8 }}>Нажмите «↻ Обновить»</p></div>}
        {!loading && safeSubs.length > 0 && filteredSubs.length === 0 && <div style={{ textAlign:"center", padding:"40px 0", color:"#bbb" }}><div style={{ fontSize:40, marginBottom:12 }}>🔍</div><p>Ничего не найдено</p></div>}
        {!loading && filteredSubs.map((sub, idx) => {
          const name = sub.answers?.s0_1 || sub.answers?.f0_1 || "Без имени";
          const city = sub.answers?.s0_4 || sub.answers?.f0_4 || "";
          const dateStr = sub.date ? new Date(sub.date).toLocaleDateString("ru-RU") : "—";
          const badge = sub.form_type === "family" ? { label:"🧬 Семейный фон", bg:"#7b5ea722", color:"#7b5ea7" }
            : sub.form_type === "documents" ? { label:"📋 Документы", bg:"#fee2e2", color:"#e84545" }
            : { label:"📋 М.И. Лынской", bg:C.tealLight, color:C.tealDark };
          return (
            <div key={sub.id || idx} style={{ background:C.grayLight, borderRadius:12, padding:"16px 20px", marginBottom:12, border:`1px solid ${C.grayBorder}` }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2, flexWrap:"wrap" }}>
                    <p style={{ margin:0, fontWeight:700, fontSize:15, color:C.dark }}>{name}</p>
                    <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:10, background:badge.bg, color:badge.color }}>{badge.label}</span>
                  </div>
                  <p style={{ margin:"0 0 2px", fontSize:12, color:C.grayMid }}>Родитель: {sub.parent_name || "—"}</p>
                  <p style={{ margin:0, fontSize:12, color:C.grayMid }}>{city}{city?" · ":""}{dateStr}</p>
                </div>
                <div style={{ display:"flex", gap:8, flexShrink:0, flexWrap:"wrap" }}>
                  <button onClick={() => { setSel(sub); topRef?.current?.scrollIntoView(); }} style={{ padding:"8px 16px", borderRadius:8, border:"none", cursor:"pointer", fontSize:13, fontWeight:700, background:C.grayLight, color:C.gray }}>👁 Просмотр</button>
                  <button onClick={() => doExport(sub)} style={{ padding:"8px 16px", borderRadius:8, border:"none", cursor:"pointer", fontSize:13, fontWeight:700, background:C.yellow, color:C.dark }}>📄 PDF</button>
                  <button onClick={() => confirmDelete(sub)} style={{ padding:"8px 16px", borderRadius:8, border:"none", cursor:"pointer", fontSize:13, fontWeight:700, background:"#fee2e2", color:"#e84545" }}>🗑️</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── DocsOnlyForm ─────────────────────────────────────────────────────────────
async function loadPreviousDocs(childName) {
  try {
    const result = await apiCall("GET", { child_name: childName.trim() });
    if (!result.data) return null;
    const row = result.data;
    return {
      id: row.id, date: row.date,
      answers: typeof row.answers === "string" ? JSON.parse(row.answers) : (row.answers || {}),
      parent_name: row.parent_name || "",
    };
  } catch(e) { return null; }
}

function DocsOnlyForm({ onSubmit }) {
  const [step, setStep] = useState("info");
  const [childName, setChildName] = useState("");
  const [parentName, setParentName] = useState("");
  const [searching, setSearching] = useState(false);
  const [prevDocs, setPrevDocs] = useState(null);
  const [prevChecked, setPrevChecked] = useState({});
  const [done, setDone] = useState(false);

  const handleSearch = async () => {
    if (!childName.trim() || !parentName.trim()) return;
    setSearching(true);
    const prev = await loadPreviousDocs(childName);
    if (prev) {
      try { setPrevChecked(JSON.parse(prev.answers?.checkedDocs || "{}")); setPrevDocs(prev); } catch(e) {}
    }
    setSearching(false);
    setStep("docs");
  };

  if (done) return (
    <div style={{ maxWidth:600, margin:"60px auto", padding:"0 20px", textAlign:"center" }}>
      <div style={{ background:C.white, borderRadius:20, padding:"60px 40px", boxShadow:"0 4px 24px rgba(42,181,181,0.12)" }}>
        <Logo size={80}/><div style={{ fontSize:56, marginBottom:16, marginTop:16 }}>📎</div>
        <h2 style={{ color:C.dark, fontSize:24, marginBottom:10 }}>Документы отправлены!</h2>
        <p style={{ color:C.grayMid, fontSize:15 }}>Спасибо! Администратор получил ваши документы.</p>
      </div>
    </div>
  );

  if (step === "docs") return (
    <DocumentsScreen parentName={parentName} childName={childName} prevChecked={prevChecked} prevDocs={prevDocs}
      onSubmit={async (docData) => { await onSubmit({ ...docData, answers: { ...docData.answers, s0_1: childName } }); setDone(true); }}/>
  );

  return (
    <div style={{ maxWidth:640, margin:"0 auto", padding:"40px 20px" }}>
      <div style={{ background:C.white, borderRadius:20, boxShadow:"0 4px 24px rgba(42,181,181,0.12)", overflow:"hidden" }}>
        <div style={{ background:`linear-gradient(135deg,${C.dark},#1a3a2a)`, padding:"28px 32px", display:"flex", alignItems:"center", gap:16 }}>
          <Logo size={52}/>
          <div>
            <h1 style={{ color:C.yellow, fontSize:18, fontWeight:800, margin:"0 0 4px" }}>Отправка документов</h1>
            <p style={{ color:C.teal, fontSize:12, margin:0 }}>Перед диагностическим консилиумом</p>
          </div>
        </div>
        <div style={{ padding:"28px 32px" }}>
          <div style={{ background:"#fff8e1", borderLeft:`4px solid ${C.yellow}`, borderRadius:"0 10px 10px 0", padding:"14px 18px", marginBottom:24, fontSize:13, color:"#555", lineHeight:1.7 }}>
            ⏰ <b>Важно:</b> все документы не позднее <b>3 суток</b> до диагностики.<br/>
            Если уже отправляли часть — введите ту же фамилию и мы покажем что уже есть.
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontSize:13, fontWeight:600, color:C.dark, marginBottom:6 }}>Фамилия и имя ребёнка <span style={{color:"#e84545"}}>*</span></label>
            <input type="text" value={childName} onChange={e=>setChildName(e.target.value)} placeholder="Например: Иванов Артём"
              style={{ width:"100%", border:`1.5px solid ${childName?C.teal:C.grayBorder}`, borderRadius:8, padding:"10px 14px", fontSize:14, color:C.dark, outline:"none", boxSizing:"border-box", background:"#fafcfc", fontFamily:"inherit" }}/>
          </div>
          <div style={{ marginBottom:28 }}>
            <label style={{ display:"block", fontSize:13, fontWeight:600, color:C.dark, marginBottom:6 }}>ФИО родителя <span style={{color:"#e84545"}}>*</span></label>
            <input type="text" value={parentName} onChange={e=>setParentName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSearch()} placeholder="Например: Иванова Мария Петровна"
              style={{ width:"100%", border:`1.5px solid ${parentName?C.teal:C.grayBorder}`, borderRadius:8, padding:"10px 14px", fontSize:14, color:C.dark, outline:"none", boxSizing:"border-box", background:"#fafcfc", fontFamily:"inherit" }}/>
          </div>
          <button onClick={handleSearch} disabled={!childName.trim()||!parentName.trim()||searching}
            style={{ padding:"13px 32px", borderRadius:8, border:"none", cursor:"pointer", fontSize:15, fontWeight:700, background:C.teal, color:"#fff", opacity:childName.trim()&&parentName.trim()?1:0.4 }}>
            {searching ? "⏳ Проверяем..." : "Перейти к документам →"}
          </button>
        </div>
      </div>
    </div>
  );
}

async function apiCall(method, params = {}) {
  const url = new URL("/api/save", window.location.origin);
  if (method === "GET" || method === "DELETE") {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString(), {
    method,
    headers: { "Content-Type": "application/json" },
    body: method === "POST" ? JSON.stringify(params) : undefined,
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

async function sendToSheets(submission) {
  try {
    let answers = submission.answers || {};
    if (submission.formType === "documents") {
      answers = {
        checkedDocs: JSON.stringify(submission.checkedDocs || {}),
        comment: submission.comment || "",
        fileNames: JSON.stringify((submission.uploadedFiles || []).map(f => ({ docId: f.docId, fileName: f.fileName, fileType: f.fileType }))),
        fileData: JSON.stringify((submission.uploadedFiles || []).map(f => ({ docId: f.docId, data: f.fileData }))),
        s0_1: submission.answers?.s0_1 || "",
      };
    }
    await apiCall("POST", {
      date: submission.date,
      answers,
      parent_name: submission.parentName || "",
      form_type: submission.formType || "anamnez",
    });
    return true;
  } catch(e) {
    console.error("Save error:", e);
    return false;
  }
}

async function loadFromSheets() {
  try {
    const result = await apiCall("GET");
    return (result.data || []).map(row => ({
      id: row.id,
      date: row.date,
      answers: typeof row.answers === "string" ? JSON.parse(row.answers) : (row.answers || {}),
      parent_name: row.parent_name || "",
      form_type: row.form_type || "anamnez",
    }));
  } catch(e) {
    console.error("Load error:", e);
    return [];
  }
}

// ─── App root ─────────────────────────────────────────────────────────────────
function AppInner() {
  const [view, setView] = React.useState("client");
  const [auth, setAuth] = React.useState(false);
  const [submissions, setSubmissions] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState(null);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const subs = await loadFromSheets();
      setSubmissions(Array.isArray(subs) ? subs : []);
    } catch(e) { setSubmissions([]); }
    setLoading(false);
  };

  const handleSubmit = async (sub) => {
    setSaveStatus("saving");
    try {
      const ok = await sendToSheets(sub);
      setSaveStatus(ok ? "ok" : "error");
    } catch(e) { setSaveStatus("error"); }
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleDelete = async (sub) => {
    try {
      await apiCall("DELETE", { id: sub.id });
      setSubmissions(prev => prev.filter(s => s.id !== sub.id));
    } catch(e) { console.error("Delete error:", e); }
  };

  return (
    <div style={{ minHeight:"100vh", background:C.grayLight, fontFamily:"'Segoe UI',Arial,sans-serif" }}>
      <Header view={view} setView={setView} auth={auth} onLogout={() => { setAuth(false); setView("client"); }}/>
      {saveStatus === "saving" && <div style={{ background:"#f5c842", color:"#1a2a2a", textAlign:"center", padding:"10px", fontSize:13, fontWeight:700 }}>⏳ Сохраняем анкету...</div>}
      {saveStatus === "ok" && <div style={{ background:"#27ae60", color:"#fff", textAlign:"center", padding:"10px", fontSize:13, fontWeight:700 }}>✅ Анкета успешно сохранена!</div>}
      {saveStatus === "error" && <div style={{ background:"#e84545", color:"#fff", textAlign:"center", padding:"10px", fontSize:13, fontWeight:700 }}>⚠️ Ошибка сохранения. Проверьте интернет.</div>}
      {view === "client" && <ClientForm onSubmit={handleSubmit}/>}
      {view === "family" && <FamilyForm onSubmit={handleSubmit}/>}
      {view === "docs" && <DocsOnlyForm onSubmit={handleSubmit}/>}
      {view === "adminLogin" && <AdminLogin onLogin={() => { setAuth(true); setView("admin"); }}/>}
      {view === "admin" && auth && <AdminPanel submissions={submissions} loading={loading} onRefresh={loadSubmissions} onDelete={handleDelete}/>}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppInner />
    </ErrorBoundary>
  );
}
