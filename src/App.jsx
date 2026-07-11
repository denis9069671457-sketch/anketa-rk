import React, { useState, useEffect, useRef } from "react";
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

  let html = `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"/>
  <style>
    @media print {
      .top-bar { display: none !important; }
      body { margin: 10mm 15mm; }
      table { page-break-inside: auto; }
      tr { page-break-inside: avoid; page-break-after: auto; }
      h2 { page-break-after: avoid; }
    }
    body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px 30px; color: #111; }
    .top-bar { position: fixed; top: 0; left: 0; right: 0; background: #1a2a2a; padding: 10px 20px; display: flex; gap: 12px; align-items: center; z-index: 99; }
    .top-bar span { color: #2ab5b5; font-weight: bold; font-size: 14px; flex: 1; }
    .btn-print { background: #2ab5b5; color: white; border: none; border-radius: 8px; padding: 8px 18px; font-size: 13px; font-weight: bold; cursor: pointer; }
    .btn-hint { background: #f5c842; color: #1a2a2a; border: none; border-radius: 8px; padding: 8px 14px; font-size: 11px; font-weight: bold; }
    .content { margin-top: 52px; }
    .title-block { text-align: center; margin-bottom: 16px; }
    .title-block h1 { font-size: 16px; font-weight: bold; margin: 0 0 4px; }
    .title-block p { font-size: 12px; color: #555; margin: 0; }
    .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
    .meta-table td { border: 1px solid #999; padding: 4px 8px; font-size: 12px; }
    .meta-table td:first-child { width: 55%; background: #f5f5f5; font-weight: 500; }
    h2 { font-size: 13px; font-weight: bold; text-align: center; background: #e8f5f5; border: 1px solid #aaa; padding: 5px; margin: 10px 0 0; }
    .section-table { width: 100%; border-collapse: collapse; margin-bottom: 0; }
    .section-table td { border: 1px solid #999; border-top: none; padding: 5px 8px; font-size: 12px; vertical-align: top; }
    .section-table tr:first-child td { border-top: none; }
    .section-table .q-cell { width: 55%; background: #fafafa; }
    .section-table .a-cell { width: 45%; }
    .q-num { color: #888; font-size: 10px; margin-right: 4px; }
    .empty { color: #bbb; font-style: italic; }
  </style></head><body>
  <div class="top-bar">
    <span>Анкета: ${esc(submission.answers["s0_1"] || "—")}</span>
    <button class="btn-print" onclick="window.print()">🖨️ Печать / PDF</button>
    <span class="btn-hint">iPad: Печать → Сохранить в Файлы</span>
  </div>
  <div class="content">
    <div class="title-block">
      <h1>Анкета по сбору анамнеза по стандарту М.И. Лынской</h1>
      <p>Дата заполнения: ${new Date(submission.date).toLocaleString("ru-RU")}</p>
    </div>`;

  // Шапка с основными данными
  html += `<table class="meta-table">
    <tr><td>Фамилия, имя ребенка</td><td>${esc(submission.answers["s0_1"])}</td></tr>
    <tr><td>Дата рождения ребенка</td><td>${esc(submission.answers["s0_2"])}</td></tr>
    <tr><td>Возраст на момент прохождения диагностики</td><td>${esc(submission.answers["s0_3"])}</td></tr>
    <tr><td>Город проживания</td><td>${esc(submission.answers["s0_4"])}</td></tr>
  </table>`;

  // Разделы — пропускаем s0 так как уже вывели
  SECTIONS.slice(1).forEach(sec => {
    html += `<h2>${sec.title}</h2>`;
    html += `<table class="section-table">`;
    sec.fields.forEach((f, i) => {
      const ans = submission.answers[f.id];
      html += `<tr>
        <td class="q-cell"><span class="q-num">${i+1}.</span>${esc(f.label)}</td>
        <td class="a-cell${ans ? "" : " empty"}">${ans ? esc(ans) : ""}</td>
      </tr>`;
    });
    html += `</table>`;
  });

  html += `</div></body></html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}


// ─── Logo component ───────────────────────────────────────────────────────────
function Logo({ size = 48 }) {
  return <img src={LOGO_B64} alt="RK Logo" style={{ width: size, height: size, objectFit:"contain" }} />;
}


const SUPABASE_URL = "https://nhlpsjwremebrbrivfbe.supabase.co";
const SUPABASE_KEY = "sb_publishable_DfIfBNa9QEQyzPrpZzcNOA_SHIx_8hD";

async function sbFetch(path, options = {}) {
  const res = await fetch(SUPABASE_URL + path, {
    ...options,
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": "Bearer " + SUPABASE_KEY,
      "Content-Type": "application/json",
      "Prefer": options.prefer || "",
      ...(options.headers || {}),
    },
  });
  return res;
}

async function sendToSheets(submission) {
  try {
    const body = {
      date: submission.date,
      answers: submission.answers || {},
      parent_name: submission.parentName || "",
      form_type: submission.formType || "anamnez",
    };
    if (submission.formType === "documents") {
      body.answers = {
        checkedDocs: JSON.stringify(submission.checkedDocs || {}),
        comment: submission.comment || "",
        fileNames: JSON.stringify((submission.uploadedFiles || []).map(f => ({ docId: f.docId, fileName: f.fileName, fileType: f.fileType }))),
        fileData: JSON.stringify((submission.uploadedFiles || []).map(f => ({ docId: f.docId, data: f.fileData }))),
      };
    }
    await sbFetch("/rest/v1/ankety", {
      method: "POST", prefer: "return=minimal",
      body: JSON.stringify(body),
    });
    return true;
  } catch(e) {
    console.error("Supabase save error:", e);
    return false;
  }
}

async function loadFromSheets() {
  try {
    const res = await sbFetch("/rest/v1/ankety?select=*&order=date.desc");
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch(e) {
    console.error("Supabase load error:", e);
    return [];
  }
}

// ─── Shared UI ────────────────────────────────────────────────────────────────
const inputStyle = {
  width:"100%", border:`1.5px solid ${C.grayBorder}`, borderRadius:8,
  padding:"10px 14px", fontSize:14, color: C.dark, outline:"none",
  resize:"vertical", boxSizing:"border-box", background:"#fafcfc",
  fontFamily:"inherit", transition:"border-color .2s",
};

function Field({ field, value, onChange }) {
  const [focused, setFocused] = useState(false);
  const style = { ...inputStyle, borderColor: focused ? C.teal : C.grayBorder };
  return field.type === "textarea"
    ? <textarea rows={3} style={style} value={value||""} onChange={e=>onChange(e.target.value)} placeholder="Введите ответ..." onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} />
    : <input type="text" style={style} value={value||""} onChange={e=>onChange(e.target.value)} placeholder="Введите ответ..." onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} />;
}

function ProgressBar({ pct, color, height = 6 }) {
  return (
    <div style={{ height, background: C.grayBorder, borderRadius:4, overflow:"hidden" }}>
      <div style={{ height:"100%", width:`${pct}%`, background: color || C.teal, borderRadius:4, transition:"width .4s" }} />
    </div>
  );
}

function Badge({ color, children }) {
  return <span style={{ display:"inline-block", padding:"2px 10px", borderRadius:12, fontSize:11, fontWeight:700, background: color+"22", color, border:`1px solid ${color}44` }}>{children}</span>;
}

function Btn({ onClick, variant="primary", disabled, children, style: extra={} }) {
  const base = {
    padding:"10px 24px", borderRadius:8, border:"none", cursor: disabled?"not-allowed":"pointer",
    fontSize:14, fontWeight:700, transition:"all .2s", letterSpacing:0.3, opacity: disabled ? 0.6 : 1,
  };
  const styles = {
    primary:  { ...base, background: C.teal, color: "#fff" },
    yellow:   { ...base, background: C.yellow, color: C.dark },
    ghost:    { ...base, background: C.grayLight, color: C.gray },
    danger:   { ...base, background: "#fee", color: "#c00" },
  };
  return <button onClick={disabled ? undefined : onClick} style={{ ...styles[variant], ...extra }}>{children}</button>;
}

// ─── Header ───────────────────────────────────────────────────────────────────
function Header({ view, setView, auth, onLogout }) {
  const navItems = [
    { key:"client", label:"📋 Анкета М.И. Лынской" },
    { key:"family", label:"🧬 Семейный фон" },
    { key:"admin",  label: auth ? "👤 Администратор" : "🔐 Администратор" },
  ];
  const handleNav = (key) => {
    if (key === "admin") { auth ? setView("admin") : setView("adminLogin"); }
    else { setView(key); }
  };
  const isActive = (key) => view === key || (key === "admin" && view === "adminLogin");
  return (
    <header style={{ background: C.dark, borderBottom:`3px solid ${C.teal}`, position:"sticky", top:0, zIndex:100 }}>
      <div style={{ maxWidth:900, margin:"0 auto", padding:"10px 16px 0", display:"flex", alignItems:"center", gap:12 }}>
        <Logo size={36} />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ color: C.yellow, fontWeight:700, fontSize:14, lineHeight:1.2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>Центр Рината Каримова</div>
          <div style={{ color: C.teal, fontSize:10, marginTop:1 }}>Анкета М.И. Лынской</div>
        </div>
        {auth && view === "admin" && (
          <button onClick={onLogout} style={{ flexShrink:0, background:"transparent", border:"1px solid rgba(255,255,255,0.2)", color:"rgba(255,255,255,0.5)", borderRadius:16, padding:"4px 10px", cursor:"pointer", fontSize:11 }}>Выйти</button>
        )}
      </div>
      <div style={{ maxWidth:900, margin:"0 auto", padding:"8px 16px 10px", display:"flex", gap:6, overflowX:"auto", WebkitOverflowScrolling:"touch" }}>
        {navItems.map(item => (
          <button key={item.key} onClick={() => handleNav(item.key)} style={{
            flexShrink:0, padding:"6px 14px", borderRadius:16, border:"none",
            cursor:"pointer", fontSize:12, fontWeight:600, whiteSpace:"nowrap",
            background: isActive(item.key) ? C.teal : "rgba(255,255,255,0.1)",
            color: isActive(item.key) ? "#fff" : "rgba(255,255,255,0.65)",
          }}>{item.label}</button>
        ))}
      </div>
    </header>
  );
}

// ─── Welcome screen ───────────────────────────────────────────────────────────
function WelcomeScreen({ onStart }) {
  return (
    <div style={{ maxWidth:780, margin:"0 auto", padding:"40px 20px" }}>
      {/* Hero card */}
      <div style={{ background: C.white, borderRadius:20, boxShadow:"0 4px 24px rgba(42,181,181,0.12)", overflow:"hidden", marginBottom:24 }}>
        <div style={{ background:`linear-gradient(135deg, ${C.dark} 0%, #1a3a3a 100%)`, padding:"36px 40px", display:"flex", alignItems:"center", gap:28 }}>
          <Logo size={80} />
          <div>
            <h1 style={{ color: C.yellow, fontSize:26, margin:"0 0 6px", fontWeight:800 }}>Анкета по сбору анамнеза</h1>
            <p style={{ color: C.teal, fontSize:14, margin:0 }}>По стандарту М.И. Лынской</p>
          </div>
        </div>
        <div style={{ padding:"32px 40px" }}>
          <div style={{ background: C.tealLight, borderRadius:12, padding:20, marginBottom:28, borderLeft:`4px solid ${C.teal}` }}>
            <p style={{ margin:0, fontSize:14, color: C.gray, lineHeight:1.8 }}>
              Анкета содержит <b style={{color:C.tealDark}}>{TOTAL} вопросов</b>, разбитых на <b style={{color:C.tealDark}}>{SECTIONS.length} разделов</b>.<br/>
              Пожалуйста, отвечайте максимально подробно — это поможет специалисту составить точную картину.<br/>
              Вы можете заполнять разделы в любом порядке и возвращаться к ним.
            </p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:32 }}>
            {SECTIONS.map(s => (
              <div key={s.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background: C.grayLight, borderRadius:10, border:`1px solid ${C.grayBorder}` }}>
                <span style={{ fontSize:20 }}>{s.icon}</span>
                <span style={{ fontSize:13, color: C.gray, flex:1 }}>{s.title}</span>
                <Badge color={s.color}>{s.fields.length}</Badge>
              </div>
            ))}
          </div>
          <Btn onClick={onStart} variant="primary" style={{ fontSize:15, padding:"12px 32px" }}>
            Начать заполнение →
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ─── Section form ─────────────────────────────────────────────────────────────
function SectionBlock({ section, answers, onChange }) {
  const filled = section.fields.filter(f => answers[f.id]).length;
  const pct = Math.round(filled / section.fields.length * 100);
  return (
    <div style={{ background: C.white, borderRadius:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", marginBottom:24, overflow:"hidden" }}>
      <div style={{ background:`linear-gradient(90deg, ${section.color}18, transparent)`, borderTop:`3px solid ${section.color}`, padding:"20px 28px 16px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
          <span style={{ fontSize:22 }}>{section.icon}</span>
          <span style={{ fontSize:17, fontWeight:700, color: C.dark }}>{section.title}</span>
          <Badge color={section.color} style={{ marginLeft:"auto" }}>{filled}/{section.fields.length}</Badge>
        </div>
        <ProgressBar pct={pct} color={section.color} />
      </div>
      <div style={{ padding:"20px 28px" }}>
        {section.fields.map((f, i) => (
          <div key={f.id} style={{ marginBottom:22 }}>
            <div style={{ fontSize:11, color: C.grayMid, marginBottom:4 }}>Вопрос {i + 1}</div>
            <div style={{ fontSize:14, color: C.gray, marginBottom:8, lineHeight:1.6, fontWeight:500 }}>{f.label}</div>
            <Field field={f} value={answers[f.id]} onChange={v => onChange(f.id, v)} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Consent screen ──────────────────────────────────────────────────────────
function ConsentScreen({ onAccept }) {
  const [checked, setChecked] = useState(false);
  const [parentName, setParentName] = useState("");
  const [nameErr, setNameErr] = useState(false);

  const handle = () => {
    if (!parentName.trim()) { setNameErr(true); return; }
    if (!checked) return;
    onAccept(parentName.trim());
  };

  return (
    <div style={{ maxWidth:780, margin:"0 auto", padding:"40px 20px" }}>
      <div style={{ background: C.white, borderRadius:20, boxShadow:"0 4px 24px rgba(42,181,181,0.12)", overflow:"hidden" }}>
        <div style={{ background:`linear-gradient(135deg, ${C.dark} 0%, #1a3a3a 100%)`, padding:"28px 36px", display:"flex", alignItems:"center", gap:20 }}>
          <Logo size={56}/>
          <div>
            <h1 style={{ color: C.yellow, fontSize:20, margin:"0 0 4px", fontWeight:800 }}>Согласие на обработку персональных данных</h1>
            <p style={{ color: C.teal, fontSize:13, margin:0 }}>В соответствии с Федеральным законом № 152-ФЗ</p>
          </div>
        </div>
        <div style={{ padding:"28px 36px" }}>
          <div style={{ background: C.tealLight, borderRadius:10, padding:"12px 18px", marginBottom:20, fontSize:12, color: C.gray, lineHeight:1.8 }}>
            <b style={{ color: C.tealDark }}>Оператор персональных данных:</b><br/>
            ИП Каримов Ринат Алишерович · ИНН 502239463615<br/>
            143401, Московская область, г. Красногорск, бульвар Павшинский, д. 3<br/>
            Руководитель: Каримов Ринат Алишерович
          </div>
          <div style={{ background:"#f8fefe", border:`1px solid ${C.tealLight}`, borderRadius:12, padding:"20px 24px", marginBottom:20, maxHeight:320, overflowY:"auto", fontSize:13, color:"#333", lineHeight:1.8 }}>
            <p style={{ fontWeight:700, marginBottom:12, fontSize:14, textAlign:"center" }}>СОГЛАСИЕ НА ОБРАБОТКУ ПЕРСОНАЛЬНЫХ ДАННЫХ</p>
            <p>Я, нижеподписавшийся(-аяся), являясь родителем (законным представителем) несовершеннолетнего ребёнка, в соответствии с требованиями Федерального закона от 27.07.2006 № 152-ФЗ «О персональных данных», свободно, своей волей и в своём интересе даю своё согласие <b>ИП Каримов Ринат Алишерович</b> (ИНН 502239463615, 143401, Московская область, г. Красногорск, бульвар Павшинский, д. 3; далее — Оператор) на обработку моих персональных данных и персональных данных моего ребёнка.</p>
            <p style={{ marginTop:12, fontWeight:600 }}>1. Цели обработки:</p>
            <p>проведение диагностики уровня речевого и психического развития ребёнка; составление индивидуальных рекомендаций и программ коррекции; ведение документации специалистов центра.</p>
            <p style={{ marginTop:12, fontWeight:600 }}>2. Перечень действий:</p>
            <p>сбор, запись, систематизация, накопление, хранение, уточнение, извлечение, использование, обезличивание, блокирование, удаление, уничтожение персональных данных с использованием средств автоматизации.</p>
            <p style={{ marginTop:12, fontWeight:600 }}>3. Срок действия:</p>
            <p>До достижения целей обработки либо до момента отзыва. Отзыв — письменное заявление Оператору. Данные уничтожаются в течение 30 дней.</p>
            <p style={{ marginTop:12, fontWeight:600 }}>4. Права субъекта:</p>
            <p>Право на доступ, уточнение, блокирование или уничтожение персональных данных; право на обжалование действий Оператора в Роскомнадзор (ст. 14 Федерального закона № 152-ФЗ).</p>
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontSize:13, fontWeight:600, color: C.dark, marginBottom:6 }}>
              ФИО родителя (законного представителя) <span style={{ color:"#e84545" }}>*</span>
            </label>
            <input
              type="text"
              placeholder="Например: Иванова Мария Петровна"
              value={parentName}
              onChange={e => { setParentName(e.target.value); setNameErr(false); }}
              style={{ width:"100%", border:`1.5px solid ${nameErr ? "#e84545" : parentName ? C.teal : C.grayBorder}`, borderRadius:8, padding:"11px 14px", fontSize:14, color: C.dark, outline:"none", boxSizing:"border-box", background:"#fafcfc", fontFamily:"inherit" }}
            />
            {nameErr && <p style={{ color:"#e84545", fontSize:12, margin:"4px 0 0" }}>Пожалуйста, укажите ФИО</p>}
          </div>
          <div
            onClick={() => setChecked(p => !p)}
            style={{ display:"flex", alignItems:"flex-start", gap:12, cursor:"pointer", marginBottom:24, padding:"14px 18px", background: checked ? "#e8f8f8" : C.grayLight, borderRadius:10, border:`2px solid ${checked ? C.teal : C.grayBorder}`, transition:"all .2s" }}
          >
            <div style={{ width:22, height:22, borderRadius:5, border:`2px solid ${checked ? C.teal : "#aaa"}`, background: checked ? C.teal : "#fff", flexShrink:0, marginTop:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
              {checked && <span style={{ color:"#fff", fontSize:14, fontWeight:900 }}>✓</span>}
            </div>
            <p style={{ margin:0, fontSize:13, color:"#333", lineHeight:1.6 }}>
              Я ознакомился(-ась) с условиями обработки персональных данных и даю своё согласие на обработку персональных данных своих и своего ребёнка в соответствии с Федеральным законом № 152-ФЗ «О персональных данных».
            </p>
          </div>
          <Btn onClick={handle} variant="primary" disabled={!checked || !parentName.trim()} style={{ fontSize:15, padding:"13px 36px", opacity: (checked && parentName.trim()) ? 1 : 0.4 }}>
            Согласен(на) — перейти к анкете →
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ─── Client form ──────────────────────────────────────────────────────────────
function ClientForm({ onSubmit }) {
  const [step, setStep] = useState("consent");
  const [curSec, setCurSec] = useState(0);
  const [answers, setAnswers] = useState({});
  const [parentName, setParentName] = useState("");
  const [familyCurSec, setFamilyCurSec] = useState(0);
  const [familyAnswers, setFamilyAnswers] = useState({});
  const topRef = useRef(null);

  const filled = ALL_FIELDS.filter(f => answers[f.id]).length;
  const pct = Math.round(filled / TOTAL * 100);

  const handleChange = (id, val) => setAnswers(p => ({ ...p, [id]: val }));
  const goSec = (n) => { setCurSec(n); setTimeout(() => topRef.current?.scrollIntoView({ behavior:"smooth" }), 50); };

  if (step === "consent") return <ConsentScreen onAccept={(name) => { setParentName(name); setStep("welcome"); }} />;

  if (step === "done") return (
    <div style={{ maxWidth:640, margin:"40px auto", padding:"0 20px", textAlign:"center" }}>
      <div style={{ background: C.white, borderRadius:20, padding:"48px 40px", boxShadow:"0 4px 24px rgba(42,181,181,0.12)", marginBottom:20 }}>
        <Logo size={72} />
        <div style={{ fontSize:52, marginBottom:12, marginTop:16 }}>✅</div>
        <h2 style={{ color: C.dark, fontSize:22, marginBottom:8 }}>Анкета отправлена!</h2>
        <p style={{ color: C.grayMid, fontSize:14, marginBottom:0 }}>Спасибо! Первая анкета успешно передана специалисту.</p>
      </div>

      {/* Блок перехода ко второй анкете */}
      <div style={{ background: "linear-gradient(135deg, #2a1a3a 0%, #1a2a2a 100%)", borderRadius:20, padding:"32px 36px", boxShadow:"0 4px 24px rgba(123,94,167,0.25)" }}>
        <div style={{ fontSize:40, marginBottom:12 }}>🧬</div>
        <h3 style={{ color: C.yellow, fontSize:20, fontWeight:800, marginBottom:8 }}>Необходимо заполнить вторую анкету</h3>
        <p style={{ color:"rgba(255,255,255,0.75)", fontSize:14, marginBottom:24, lineHeight:1.7 }}>
          Для полноценной диагностики специалисту также нужна <b style={{color:"#9b7fd4"}}>Анкета семейно-наследственного фона</b>.<br/>
          Пожалуйста, не закрывайте страницу и заполните её прямо сейчас — это займёт 5–10 минут.
        </p>
        <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
          <Btn
            onClick={() => { setStep("family"); setCurSec(0); setAnswers({}); }}
            variant="yellow"
            style={{ fontSize:15, padding:"14px 32px" }}
          >
            Заполнить анкету семейного фона →
          </Btn>
        </div>
        <p style={{ color:"rgba(255,255,255,0.35)", fontSize:11, marginTop:16 }}>
          Данные конфиденциальны и используются только специалистами центра
        </p>
      </div>
    </div>
  );

  if (step === "familyDone") return (
    <DocumentsScreen
      parentName={parentName}
      childName={answers["s0_1"] || ""}
      onSubmit={async (docData) => {
        await onSubmit(docData);
        setStep("allDone");
      }}
    />
  );

  if (step === "allDone") return (
    <div style={{ maxWidth:600, margin:"60px auto", padding:"0 20px", textAlign:"center" }}>
      <div style={{ background: C.white, borderRadius:20, padding:"60px 40px", boxShadow:"0 4px 24px rgba(42,181,181,0.12)" }}>
        <Logo size={80} />
        <div style={{ fontSize:56, marginBottom:16, marginTop:16 }}>🎉</div>
        <h2 style={{ color: C.dark, fontSize:24, marginBottom:10 }}>Всё готово!</h2>
        <p style={{ color: C.grayMid, fontSize:15, marginBottom:8 }}>Обе анкеты и список документов успешно переданы специалисту.</p>
        <p style={{ color: C.teal, fontSize:13 }}>Специалист свяжется с вами для уточнения деталей диагностики.</p>
      </div>
    </div>
  );

  if (step === "welcome") return <WelcomeScreen onStart={() => setStep("form")} />;

  // ── Семейный фон (вторая анкета) ──
  if (step === "family") {
    const FSECS = typeof FAMILY_SECTIONS !== "undefined" ? FAMILY_SECTIONS : [];
    const FALL = FSECS.flatMap(s => s.fields);
    const fFilled = FALL.filter(f => familyAnswers[f.id]).length;
    const fPct = FALL.length > 0 ? Math.round(fFilled / FALL.length * 100) : 0;
    const fSec = FSECS[familyCurSec] || null;
    const goFSec = (n) => { setFamilyCurSec(n); setTimeout(() => topRef.current?.scrollIntoView({ behavior:"smooth" }), 50); };

    if (!fSec) return null;

    return (
      <div style={{ maxWidth:820, margin:"0 auto", padding:"28px 20px" }}>
        <div ref={topRef}/>
        <div style={{ background:"linear-gradient(135deg,#2a1a3a,#1a2a2a)", borderRadius:14, padding:"16px 24px", marginBottom:20, display:"flex", alignItems:"center", gap:14 }}>
          <span style={{ fontSize:28 }}>🧬</span>
          <div>
            <p style={{ color:C.yellow, fontWeight:700, fontSize:15, margin:0 }}>Анкета семейно-наследственного фона</p>
            <p style={{ color:"rgba(255,255,255,0.6)", fontSize:12, margin:0 }}>Вторая анкета — шаг {familyCurSec+1} из {FSECS.length}</p>
          </div>
          <span style={{ marginLeft:"auto", color:"#9b7fd4", fontWeight:700, fontSize:14 }}>{fPct}%</span>
        </div>
        <div style={{ background:C.white, borderRadius:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", padding:"16px 20px", marginBottom:20 }}>
          <ProgressBar pct={fPct} color="linear-gradient(90deg,#7b5ea7,#f5c842)" height={8}/>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:12 }}>
            {FSECS.map((s, i) => {
              const sf = s.fields.filter(f => familyAnswers[f.id]).length;
              const done = sf === s.fields.length;
              const active = familyCurSec === i;
              return (
                <button key={s.id} onClick={() => goFSec(i)} style={{
                  padding:"5px 12px", borderRadius:20, cursor:"pointer", fontSize:12, fontWeight:600,
                  border:`2px solid ${active?s.color:done?s.color+"66":C.grayBorder}`,
                  background:active?s.color:done?s.color+"15":C.grayLight,
                  color:active?"#fff":done?s.color:C.grayMid,
                }}>{s.icon} {sf}/{s.fields.length}</button>
              );
            })}
          </div>
        </div>
        <SectionBlock section={fSec} answers={familyAnswers} onChange={(id,val) => setFamilyAnswers(p => ({...p,[id]:val}))}/>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:4 }}>
          <Btn onClick={() => goFSec(familyCurSec-1)} variant="ghost" disabled={familyCurSec===0}>← Назад</Btn>
          <span style={{ fontSize:13, color:C.grayMid }}>Раздел {familyCurSec+1} из {FSECS.length}</span>
          {familyCurSec < FSECS.length-1
            ? <Btn onClick={() => goFSec(familyCurSec+1)} variant="primary" style={{background:"#7b5ea7"}}>Далее →</Btn>
            : <Btn onClick={async () => {
                const familySub = { id: Date.now(), date: new Date().toISOString(), answers: {...familyAnswers}, parentName, formType:"family" };
                await onSubmit(familySub);
                setStep("familyDone");
              }} variant="yellow">✅ Отправить обе анкеты</Btn>
          }
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth:820, margin:"0 auto", padding:"28px 20px" }}>
      <div ref={topRef} />

      {/* Progress panel */}
      <div style={{ background: C.white, borderRadius:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", padding:"20px 24px", marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
          <span style={{ fontWeight:700, color: C.dark, fontSize:14 }}>Общий прогресс</span>
          <span style={{ color: C.teal, fontWeight:700, fontSize:14 }}>{pct}% · {filled}/{TOTAL}</span>
        </div>
        <ProgressBar pct={pct} color={`linear-gradient(90deg, ${C.teal}, ${C.yellow})`} height={8} />
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:14 }}>
          {SECTIONS.map((s, i) => {
            const sf = s.fields.filter(f => answers[f.id]).length;
            const done = sf === s.fields.length;
            const active = curSec === i;
            return (
              <button key={s.id} onClick={() => goSec(i)} style={{
                padding:"5px 12px", borderRadius:20, cursor:"pointer", fontSize:12, fontWeight:600, transition:"all .2s",
                border: `2px solid ${active ? s.color : done ? s.color+"66" : C.grayBorder}`,
                background: active ? s.color : done ? s.color+"15" : C.grayLight,
                color: active ? "#fff" : done ? s.color : C.grayMid,
              }}>
                {s.icon} {sf}/{s.fields.length}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section */}
      <SectionBlock section={SECTIONS[curSec]} answers={answers} onChange={handleChange} />

      {/* Nav buttons */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:4 }}>
        <Btn onClick={() => goSec(curSec - 1)} variant="ghost" disabled={curSec === 0}>← Назад</Btn>
        <span style={{ fontSize:13, color: C.grayMid }}>Раздел {curSec + 1} из {SECTIONS.length}</span>
        {curSec < SECTIONS.length - 1
          ? <Btn onClick={() => goSec(curSec + 1)} variant="primary">Далее →</Btn>
          : <Btn onClick={() => { onSubmit({ id: Date.now(), date: new Date().toISOString(), answers, parentName }); setStep("done"); }} variant="yellow">✅ Отправить анкету</Btn>
        }
      </div>
    </div>
  );
}

// ─── Family Form ─────────────────────────────────────────────────────────────
function FamilyForm({ onSubmit }) {
  const [step, setStep] = useState("consent");
  const [curSec, setCurSec] = useState(0);
  const [answers, setAnswers] = useState({});
  const [parentName, setParentName] = useState("");
  const [familyCurSec, setFamilyCurSec] = useState(0);
  const [familyAnswers, setFamilyAnswers] = useState({});
  const topRef = useRef(null);

  const filled = ALL_FAMILY_FIELDS.filter(f => answers[f.id]).length;
  const pct = Math.round(filled / FAMILY_TOTAL * 100);
  const handleChange = (id, val) => setAnswers(p => ({ ...p, [id]: val }));
  const goSec = (n) => { setCurSec(n); setTimeout(() => topRef.current?.scrollIntoView({ behavior:"smooth" }), 50); };

  if (step === "consent") return <ConsentScreen onAccept={(name) => { setParentName(name); setStep("form"); }} />;

  if (step === "done") return (
    <div style={{ maxWidth:600, margin:"60px auto", padding:"0 20px", textAlign:"center" }}>
      <div style={{ background: C.white, borderRadius:20, padding:"60px 40px", boxShadow:"0 4px 24px rgba(42,181,181,0.12)" }}>
        <Logo size={80} />
        <div style={{ fontSize:56, marginBottom:16, marginTop:16 }}>✅</div>
        <h2 style={{ color: C.dark, fontSize:24, marginBottom:10 }}>Анкета отправлена!</h2>
        <p style={{ color: C.grayMid, fontSize:15 }}>Спасибо! Ваши данные успешно переданы специалисту.</p>
      </div>
    </div>
  );

  const sec = FAMILY_SECTIONS[curSec];

  return (
    <div style={{ maxWidth:820, margin:"0 auto", padding:"28px 20px" }}>
      <div ref={topRef} />
      <div style={{ background: C.white, borderRadius:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", padding:"20px 24px", marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
          <span style={{ fontWeight:700, color: C.dark, fontSize:14 }}>Общий прогресс</span>
          <span style={{ color: C.teal, fontWeight:700, fontSize:14 }}>{pct}% · {filled}/{FAMILY_TOTAL}</span>
        </div>
        <ProgressBar pct={pct} color={`linear-gradient(90deg, ${C.teal}, ${C.yellow})`} height={8} />
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:14 }}>
          {FAMILY_SECTIONS.map((s, i) => {
            const sf = s.fields.filter(f => answers[f.id]).length;
            const done = sf === s.fields.length;
            const active = curSec === i;
            return (
              <button key={s.id} onClick={() => goSec(i)} style={{
                padding:"5px 12px", borderRadius:20, cursor:"pointer", fontSize:12, fontWeight:600, transition:"all .2s",
                border: `2px solid ${active ? s.color : done ? s.color+"66" : C.grayBorder}`,
                background: active ? s.color : done ? s.color+"15" : C.grayLight,
                color: active ? "#fff" : done ? s.color : C.grayMid,
              }}>
                {s.icon} {sf}/{s.fields.length}
              </button>
            );
          })}
        </div>
      </div>

      <SectionBlock section={sec} answers={answers} onChange={handleChange} />

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:4 }}>
        <Btn onClick={() => goSec(curSec - 1)} variant="ghost" disabled={curSec === 0}>← Назад</Btn>
        <span style={{ fontSize:13, color: C.grayMid }}>Раздел {curSec + 1} из {FAMILY_SECTIONS.length}</span>
        {curSec < FAMILY_SECTIONS.length - 1
          ? <Btn onClick={() => goSec(curSec + 1)} variant="primary">Далее →</Btn>
          : <Btn onClick={() => { onSubmit({ id: Date.now(), date: new Date().toISOString(), answers, parentName, formType:"family" }); setStep("done"); }} variant="yellow">✅ Отправить анкету</Btn>
        }
      </div>
    </div>
  );
}

// ─── Documents Screen ────────────────────────────────────────────────────────
function DocumentsScreen({ parentName, childName, onSubmit }) {
  const [checked, setChecked] = useState({});
  const [files, setFiles] = useState({});
  const [uploading, setUploading] = useState(false);
  const [comment, setComment] = useState("");

  const toggleCheck = (id) => setChecked(p => ({ ...p, [id]: !p[id] }));

  const handleFile = (id, e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFiles(p => ({ ...p, [id]: { name: f.name, type: f.type, size: f.size, data: ev.target.result } }));
    };
    reader.readAsDataURL(f);
  };

  const removeFile = (id) => setFiles(p => { const n = {...p}; delete n[id]; return n; });

  const totalChecked = Object.values(checked).filter(Boolean).length;
  const totalFiles = Object.keys(files).length;
  const allItems = DOCUMENTS.flatMap(d => d.items);

  const handleSubmit = async () => {
    setUploading(true);
    const docData = {
      id: Date.now(),
      date: new Date().toISOString(),
      parentName,
      childName,
      checkedDocs: checked,
      uploadedFiles: Object.entries(files).map(([id, f]) => ({
        docId: id,
        fileName: f.name,
        fileType: f.type,
        fileSize: f.size,
        fileData: f.data,
      })),
      comment,
      formType: "documents",
    };
    await onSubmit(docData);
    setUploading(false);
  };

  return (
    <div style={{ maxWidth:820, margin:"0 auto", padding:"28px 20px" }}>
      {/* Шапка */}
      <div style={{ background:"linear-gradient(135deg,#1a2a2a,#2a1a1a)", borderRadius:16, padding:"24px 28px", marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:12 }}>
          <span style={{ fontSize:32 }}>📋</span>
          <div>
            <h2 style={{ color: C.yellow, fontSize:18, fontWeight:800, margin:0 }}>Список необходимых документов</h2>
            <p style={{ color:"rgba(255,255,255,0.6)", fontSize:12, margin:"4px 0 0" }}>Шаг 3 из 3 — перед диагностическим консилиумом</p>
          </div>
        </div>
        <div style={{ background:"rgba(255,255,255,0.08)", borderRadius:10, padding:"14px 18px", fontSize:13, color:"rgba(255,255,255,0.8)", lineHeight:1.7 }}>
          Уважаемые родители! Без полного пакета документов мы не сможем начать работу в день диагностики. Все материалы необходимо прислать <b style={{color:C.yellow}}>не позднее чем за 3 суток</b> до начала диагностики. Отметьте галочками что уже есть и прикрепите файлы.
        </div>
      </div>

      {/* Статус */}
      {totalChecked > 0 && (
        <div style={{ background:C.tealLight, borderRadius:10, padding:"10px 16px", marginBottom:16, fontSize:13, color:C.tealDark, fontWeight:600 }}>
          ✅ Отмечено: {totalChecked} из {allItems.length} · Прикреплено файлов: {totalFiles}
        </div>
      )}

      {/* Список документов */}
      {DOCUMENTS.map(docGroup => (
        <div key={docGroup.id} style={{ background:C.white, borderRadius:14, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", marginBottom:16, overflow:"hidden" }}>
          <div style={{ padding:"16px 20px", borderBottom:`2px solid ${docGroup.required ? "#fee2e2" : C.tealLight}`, display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:16, fontWeight:700, color:C.dark }}>{docGroup.category}</span>
            {docGroup.required && <span style={{ fontSize:11, fontWeight:700, background:"#fee2e2", color:"#e84545", padding:"2px 8px", borderRadius:10 }}>ОБЯЗАТЕЛЬНО</span>}
          </div>
          <div style={{ padding:"12px 20px" }}>
            {docGroup.items.map(item => (
              <div key={item.id} style={{ marginBottom:14, paddingBottom:14, borderBottom:`1px solid ${C.grayBorder}` }}>
                {/* Чекбокс и название */}
                <div
                  onClick={() => toggleCheck(item.id)}
                  style={{ display:"flex", alignItems:"flex-start", gap:12, cursor:"pointer", marginBottom:8 }}
                >
                  <div style={{ width:22, height:22, borderRadius:5, border:`2px solid ${checked[item.id] ? C.teal : "#ccc"}`, background:checked[item.id] ? C.teal : "#fff", flexShrink:0, marginTop:1, display:"flex", alignItems:"center", justifyContent:"center", transition:"all .2s" }}>
                    {checked[item.id] && <span style={{ color:"#fff", fontSize:13, fontWeight:900 }}>✓</span>}
                  </div>
                  <div>
                    <p style={{ margin:0, fontSize:14, fontWeight:600, color: checked[item.id] ? C.tealDark : C.dark }}>{item.label}</p>
                    {item.note && <p style={{ margin:"2px 0 0", fontSize:12, color:C.grayMid }}>{item.note}</p>}
                  </div>
                </div>

                {/* Загрузка файла */}
                <div style={{ marginLeft:34 }}>
                  {files[item.id] ? (
                    <div style={{ display:"flex", alignItems:"center", gap:8, background:C.tealLight, borderRadius:8, padding:"8px 12px" }}>
                      <span style={{ fontSize:18 }}>📎</span>
                      <span style={{ fontSize:13, color:C.tealDark, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{files[item.id].name}</span>
                      <button onClick={() => removeFile(item.id)} style={{ background:"none", border:"none", color:"#e84545", cursor:"pointer", fontSize:18, padding:0, flexShrink:0 }}>×</button>
                    </div>
                  ) : (
                    <label style={{ display:"inline-flex", alignItems:"center", gap:6, cursor:"pointer", padding:"6px 14px", background:C.grayLight, borderRadius:8, border:`1px dashed ${C.grayBorder}`, fontSize:12, color:C.grayMid }}>
                      <span>📎</span> Прикрепить файл или фото
                      <input type="file" accept="image/*,.pdf,.doc,.docx" style={{ display:"none" }} onChange={e => handleFile(item.id, e)} />
                    </label>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Комментарий */}
      <div style={{ background:C.white, borderRadius:14, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", padding:"20px", marginBottom:20 }}>
        <p style={{ fontSize:14, fontWeight:600, color:C.dark, marginBottom:8 }}>💬 Дополнительный комментарий (необязательно)</p>
        <textarea
          rows={3}
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Например: анализ ЭЭГ сдаём на следующей неделе, МРТ делали 2 года назад..."
          style={{ width:"100%", border:`1.5px solid ${C.grayBorder}`, borderRadius:8, padding:"10px 14px", fontSize:14, color:C.dark, outline:"none", resize:"vertical", boxSizing:"border-box", background:"#fafcfc", fontFamily:"inherit" }}
        />
      </div>

      {/* Кнопка отправки */}
      <div style={{ background:"linear-gradient(135deg,#1a3a2a,#1a2a1a)", borderRadius:14, padding:"24px 28px", textAlign:"center" }}>
        <p style={{ color:"rgba(255,255,255,0.7)", fontSize:13, marginBottom:16, lineHeight:1.6 }}>
          Нажимая кнопку вы отправляете список отмеченных документов и прикреплённые файлы администратору центра.
        </p>
        <Btn onClick={handleSubmit} variant="yellow" disabled={uploading} style={{ fontSize:15, padding:"14px 36px" }}>
          {uploading ? "⏳ Отправляем..." : `✅ Отправить документы (${totalChecked} отмечено, ${totalFiles} файлов)`}
        </Btn>
      </div>
    </div>
  );
}

// ─── Admin login ──────────────────────────────────────────────────────────────
function AdminLogin({ onLogin }) {
  const [pw, setPw] = useState(""); const [err, setErr] = useState(false);
  const check = () => pw === ADMIN_PASSWORD ? onLogin() : setErr(true);
  return (
    <div style={{ maxWidth:420, margin:"80px auto", padding:"0 20px" }}>
      <div style={{ background: C.white, borderRadius:20, boxShadow:"0 4px 24px rgba(42,181,181,0.12)", padding:"48px 40px", textAlign:"center" }}>
        <Logo size={64} />
        <h2 style={{ fontSize:22, color: C.dark, margin:"20px 0 24px" }}>Вход для администратора</h2>
        <input type="password" style={{ ...inputStyle, marginBottom:12, textAlign:"center" }} placeholder="Введите пароль"
          value={pw} onChange={e => { setPw(e.target.value); setErr(false); }} onKeyDown={e => e.key === "Enter" && check()} />
        {err && <p style={{ color:"#e05050", fontSize:13, margin:"0 0 12px" }}>Неверный пароль</p>}
        <Btn onClick={check} variant="primary" style={{ width:"100%" }}>Войти</Btn>
        
      </div>
    </div>
  );
}

// ─── Admin panel ──────────────────────────────────────────────────────────────
const DELETE_PASSWORD = "3222";

function AdminPanel({ submissions, loading, onRefresh, onDelete }) {
  const [sel, setSel] = useState(null);
  const topRef = useRef(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletePw, setDeletePw] = useState("");
  const [deleteErr, setDeleteErr] = useState(false);
  const [search, setSearch] = useState("");

  const safeSubs = (() => {
    try { return Array.isArray(submissions) ? submissions : []; }
    catch(e) { return []; }
  })();

  const filteredSubs = search.trim()
    ? safeSubs.filter(sub => {
        const name = (sub.answers && sub.answers["s0_1"]) ? sub.answers["s0_1"].toLowerCase() : "";
        const parent = (sub.parent_name || sub.parentName || "").toLowerCase();
        const q = search.toLowerCase().trim();
        return name.includes(q) || parent.includes(q);
      })
    : safeSubs;

  const doExport = (sub) => {
    try { exportToWord(sub); } catch(e) { alert("Ошибка экспорта"); }
  };

  const confirmDelete = (sub) => {
    setDeleteTarget(sub);
    setDeletePw("");
    setDeleteErr(false);
  };

  const executeDelete = () => {
    if (deletePw === DELETE_PASSWORD) {
      onDelete(deleteTarget);
      setDeleteTarget(null);
      setDeletePw("");
      if (sel && sel.id === deleteTarget.id) setSel(null);
    } else {
      setDeleteErr(true);
    }
  };

  // Delete confirmation modal
  const DeleteModal = deleteTarget ? (
    <div style={{
      position:"fixed", top:0, left:0, right:0, bottom:0,
      background:"rgba(0,0,0,0.6)", zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center", padding:20
    }}>
      <div style={{
        background:"#fff", borderRadius:16, padding:"36px 32px",
        maxWidth:400, width:"100%", textAlign:"center",
        boxShadow:"0 8px 40px rgba(0,0,0,0.3)"
      }}>
        <div style={{ fontSize:48, marginBottom:12 }}>🗑️</div>
        <h3 style={{ fontSize:18, color:"#1a2a2a", marginBottom:8 }}>Удалить анкету?</h3>
        <p style={{ fontSize:13, color:"#666", marginBottom:20 }}>
          <b>{deleteTarget.answers && deleteTarget.answers["s0_1"] ? deleteTarget.answers["s0_1"] : "Без имени"}</b><br/>
          Это действие нельзя отменить.
        </p>
        <input
          type="password"
          placeholder="Введите пароль для удаления"
          value={deletePw}
          onChange={e => { setDeletePw(e.target.value); setDeleteErr(false); }}
          onKeyDown={e => e.key === "Enter" && executeDelete()}
          style={{
            width:"100%", border:`1.5px solid ${deleteErr ? "#e05050" : "#e2e8f0"}`,
            borderRadius:8, padding:"10px 14px", fontSize:14,
            textAlign:"center", outline:"none", marginBottom:8, boxSizing:"border-box"
          }}
          autoFocus
        />
        {deleteErr && <p style={{ color:"#e05050", fontSize:13, margin:"0 0 12px" }}>Неверный пароль</p>}
        <div style={{ display:"flex", gap:10, marginTop:4 }}>
          <button
            onClick={() => { setDeleteTarget(null); setDeletePw(""); setDeleteErr(false); }}
            style={{ flex:1, padding:"10px", borderRadius:8, border:"1.5px solid #e2e8f0", background:"#f4f6f8", cursor:"pointer", fontSize:14, fontWeight:600 }}
          >Отмена</button>
          <button
            onClick={executeDelete}
            style={{ flex:1, padding:"10px", borderRadius:8, border:"none", background:"#e84545", color:"#fff", cursor:"pointer", fontSize:14, fontWeight:700 }}
          >Удалить</button>
        </div>
      </div>
    </div>
  ) : null;

  if (sel) {
    let secList = [];
    try { secList = SECTIONS; } catch(e) {}
    return (
      <div style={{ maxWidth:820, margin:"0 auto", padding:"28px 20px" }}>
        {DeleteModal}
        <div ref={topRef} />
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, gap:10, flexWrap:"wrap" }}>
          <button onClick={() => setSel(null)} style={{ padding:"10px 24px", borderRadius:8, border:"none", cursor:"pointer", fontSize:14, fontWeight:700, background: C.grayLight, color: C.gray, transition:"all .2s" }}>← Все анкеты</button>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={() => doExport(sel)} style={{ padding:"10px 24px", borderRadius:8, border:"none", cursor:"pointer", fontSize:14, fontWeight:700, background: C.yellow, color: C.dark, transition:"all .2s" }}>📄 Открыть для печати</button>
            <button onClick={() => confirmDelete(sel)} style={{ padding:"10px 24px", borderRadius:8, border:"none", cursor:"pointer", fontSize:14, fontWeight:700, background:"#fee2e2", color:"#e84545", transition:"all .2s" }}>🗑️ Удалить</button>
          </div>
        </div>
        <div style={{ background:C.white, borderRadius:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", padding:"28px 32px" }}>
          <h2 style={{ fontSize:20, color:C.dark, marginBottom:4 }}>{sel.answers && sel.answers["s0_1"] ? sel.answers["s0_1"] : "—"}</h2>
          <p style={{ fontSize:13, color:C.grayMid, marginBottom:4 }}>
            Родитель (законный представитель): <b style={{color:C.dark}}>{sel.parent_name || sel.parentName || "—"}</b>
          </p>
          <p style={{ fontSize:13, color:C.grayMid, marginBottom:20 }}>
            Дата заполнения: {sel.date ? new Date(sel.date).toLocaleString("ru-RU") : "—"}
          </p>
          {/* Документы */}
          {sel.form_type === "documents" && (() => {
            const checked = (() => { try { return JSON.parse(sel.answers?.checkedDocs || "{}"); } catch(e) { return {}; } })();
            const fileNames = (() => { try { return JSON.parse(sel.answers?.fileNames || "[]"); } catch(e) { return []; } })();
            const fileData = (() => { try { return JSON.parse(sel.answers?.fileData || "[]"); } catch(e) { return []; } })();
            const totalChecked = Object.values(checked).filter(Boolean).length;
            return (
              <div>
                <div style={{ background:"#f0fafa", borderRadius:10, padding:"14px 18px", marginBottom:20, fontSize:13 }}>
                  <b style={{color:C.tealDark}}>📋 Документы клиента:</b> отмечено {totalChecked} из {DOCUMENTS.flatMap(d=>d.items).length} · прикреплено файлов: {fileNames.length}
                  {sel.answers?.comment && <p style={{margin:"8px 0 0", color:C.gray}}>💬 Комментарий: {sel.answers.comment}</p>}
                </div>
                {DOCUMENTS.map(group => (
                  <div key={group.id} style={{marginBottom:16}}>
                    <p style={{fontSize:13, fontWeight:700, color:C.dark, marginBottom:8, borderBottom:`2px solid ${group.required?"#fee2e2":C.tealLight}`, paddingBottom:6}}>
                      {group.category} {group.required && <span style={{fontSize:11,color:"#e84545"}}>(ОБЯЗАТЕЛЬНО)</span>}
                    </p>
                    {group.items.map(item => {
                      const isChecked = checked[item.id];
                      const file = fileNames.find(f => f.docId === item.id);
                      const fd = fileData.find(f => f.docId === item.id);
                      return (
                        <div key={item.id} style={{display:"flex", alignItems:"center", gap:10, marginBottom:8, padding:"8px 12px", background:isChecked?"#e8f8f8":"#fafafa", borderRadius:8}}>
                          <span style={{fontSize:16}}>{isChecked ? "✅" : "⬜"}</span>
                          <span style={{flex:1, fontSize:13, color:isChecked?C.tealDark:C.grayMid}}>{item.label}</span>
                          {file && fd && (
                            <a href={fd.data} download={file.fileName} style={{fontSize:12, color:C.teal, fontWeight:600, textDecoration:"none", background:C.tealLight, padding:"4px 10px", borderRadius:8}}>
                              📎 {file.fileName}
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            );
          })()}
          {secList.map(sec => (
            <div key={sec.id} style={{ marginBottom:24 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12, paddingBottom:8, borderBottom:`2px solid ${sec.color}33` }}>
                <span style={{ fontSize:18 }}>{sec.icon}</span>
                <span style={{ fontSize:15, fontWeight:700, color:C.dark }}>{sec.title}</span>
              </div>
              {sec.fields.map((f, i) => (
                <div key={f.id} style={{ marginBottom:12, paddingBottom:12, borderBottom:`1px solid ${C.grayBorder}` }}>
                  <p style={{ fontSize:12, color:"#aaa", margin:"0 0 3px" }}>{i+1}. {f.label}</p>
                  <p style={{ fontSize:13, color: sel.answers && sel.answers[f.id] ? C.dark : "#ccc", margin:0, background:C.grayLight, padding:"7px 10px", borderRadius:6, whiteSpace:"pre-wrap", fontStyle: sel.answers && sel.answers[f.id] ? "normal" : "italic" }}>
                    {sel.answers && sel.answers[f.id] ? sel.answers[f.id] : "Нет ответа"}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth:820, margin:"0 auto", padding:"28px 20px" }}>
      {DeleteModal}
      <div style={{ background:C.white, borderRadius:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)", padding:"28px 32px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20 }}>
          <Logo size={44} />
          <div>
            <h2 style={{ margin:0, fontSize:20, color:C.dark }}>Панель администратора</h2>
            <p style={{ margin:"2px 0 0", fontSize:13, color:C.grayMid }}>Всего анкет: {safeSubs.length} · общая база для всех администраторов</p>
          </div>
          <button onClick={onRefresh} disabled={loading} style={{ marginLeft:"auto", padding:"8px 16px", borderRadius:8, border:"none", cursor:"pointer", fontSize:12, fontWeight:700, background: C.grayLight, color: C.gray }}>
            {loading ? "⏳ Загружаем..." : "↻ Обновить"}
          </button>
        </div>

        {/* Поиск */}
        <div style={{ position:"relative", marginBottom:16 }}>
          <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:15, color:C.grayMid, pointerEvents:"none" }}>🔍</span>
          <input
            type="text"
            placeholder="Поиск по фамилии или имени ребёнка..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width:"100%", border:`1.5px solid ${search ? C.teal : C.grayBorder}`,
              borderRadius:10, padding:"11px 14px 11px 42px", fontSize:14,
              color: C.dark, outline:"none", boxSizing:"border-box",
              background:"#fafcfc", fontFamily:"inherit", transition:"border-color .2s"
            }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:20, color:C.grayMid, lineHeight:1, padding:0 }}>×</button>
          )}
        </div>
        {search.trim() && (
          <p style={{ fontSize:13, color:C.grayMid, marginBottom:12 }}>
            Найдено: <b style={{color:C.teal}}>{filteredSubs.length}</b> из {safeSubs.length}
          </p>
        )}

        {loading && (
          <div style={{ textAlign:"center", padding:"40px 0", color:C.grayMid }}>
            <div style={{ fontSize:32, marginBottom:12 }}>⏳</div>
            <p>Загружаем анкеты...</p>
          </div>
        )}

        {!loading && safeSubs.length === 0 && (
          <div style={{ textAlign:"center", padding:"48px 0", color:"#bbb" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>📋</div>
            <p>Пока нет заполненных анкет</p>
            <p style={{ fontSize:12, marginTop:8 }}>Нажмите «↻ Обновить» чтобы загрузить</p>
          </div>
        )}
        {!loading && safeSubs.length > 0 && filteredSubs.length === 0 && (
          <div style={{ textAlign:"center", padding:"48px 0", color:"#bbb" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🔍</div>
            <p>Ничего не найдено по запросу «{search}»</p>
            <p style={{ fontSize:12, marginTop:8 }}>Попробуйте изменить запрос</p>
          </div>
        )}

        {!loading && filteredSubs.map((sub, idx) => {
          let filled = 0;
          try { filled = ALL_FIELDS.filter(f => sub.answers && sub.answers[f.id]).length; } catch(e) {}
          const pct = Math.round(filled / TOTAL * 100);
          const name = (sub.answers && sub.answers["s0_1"]) ? sub.answers["s0_1"] : "Без имени";
          const city = (sub.answers && sub.answers["s0_4"]) ? sub.answers["s0_4"] : "";
          const dateStr = sub.date ? new Date(sub.date).toLocaleDateString("ru-RU") : "—";
          return (
            <div key={sub.id || idx} style={{ background:C.grayLight, borderRadius:12, padding:"16px 20px", marginBottom:12, border:`1px solid ${C.grayBorder}` }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2, flexWrap:"wrap" }}>
                    <p style={{ margin:0, fontWeight:700, fontSize:15, color:C.dark }}>{name}</p>
                    <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:10,
                      background: sub.form_type==="family" ? "#7b5ea722" : sub.form_type==="documents" ? "#fee2e2" : C.tealLight,
                      color: sub.form_type==="family" ? "#7b5ea7" : sub.form_type==="documents" ? "#e84545" : C.tealDark,
                      border: `1px solid ${sub.form_type==="family" ? "#7b5ea744" : sub.form_type==="documents" ? "#e8454544" : C.teal+"44"}`
                    }}>{sub.form_type==="family" ? "🧬 Семейный фон" : sub.form_type==="documents" ? "📋 Документы" : "📋 М.И. Лынской"}</span>
                  </div>
                  <p style={{ margin:"0 0 2px", fontSize:12, color:C.grayMid }}>
                    Родитель: {sub.parent_name || sub.parentName || "—"}
                  </p>
                  <p style={{ margin:"0 0 8px", fontSize:12, color:C.grayMid }}>
                    {city}{city ? " · " : ""}{dateStr} · {filled}/{TOTAL} ({pct}%)
                  </p>
                  <div style={{ height:4, background:C.grayBorder, borderRadius:4, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${pct}%`, background:C.teal, borderRadius:4 }} />
                  </div>
                </div>
                <div style={{ display:"flex", gap:8, flexShrink:0, flexWrap:"wrap" }}>
                  <button onClick={() => { setSel(sub); topRef?.current?.scrollIntoView(); }} style={{ padding:"8px 16px", borderRadius:8, border:"none", cursor:"pointer", fontSize:13, fontWeight:700, background: C.grayLight, color: C.gray }}>👁 Просмотр</button>
                  <button onClick={() => doExport(sub)} style={{ padding:"8px 16px", borderRadius:8, border:"none", cursor:"pointer", fontSize:13, fontWeight:700, background: C.yellow, color: C.dark }}>📄 PDF</button>
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


// ─── App root ─────────────────────────────────────────────────────────────────
function AppInner() {
  const [view, setView] = useState("client");
  const [auth, setAuth] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const subs = await loadFromSheets();
      setSubmissions(Array.isArray(subs) ? subs : []);
    } catch(e) {
      console.error("Load error:", e);
      setSubmissions([]);
    }
    setLoading(false);
  };

  const handleSubmit = async (sub) => {
    setSaveStatus("saving");
    try {
      const ok = await sendToSheets(sub);
      setSaveStatus(ok ? "ok" : "error");
    } catch(e) {
      setSaveStatus("error");
    }
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleDelete = async (sub) => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/ankety?id=eq.${sub.id}`, {
        method: "DELETE",
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": "Bearer " + SUPABASE_KEY,
          "Content-Type": "application/json",
          "Prefer": "return=minimal",
        },
      });
      if (res.ok || res.status === 204) {
        setSubmissions(prev => prev.filter(s => s.id !== sub.id));
      } else {
        const err = await res.text();
        console.error("Delete failed:", res.status, err);
      }
    } catch(e) {
      console.error("Delete error:", e);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background: C.grayLight, fontFamily:"'Segoe UI', Arial, sans-serif" }}>
      <Header
        view={view} setView={setView} auth={auth}
        onLogout={() => { setAuth(false); setView("client"); }}
      />
      {saveStatus === "saving" && (
        <div style={{ background:"#f5c842", color:"#1a2a2a", textAlign:"center", padding:"10px", fontSize:13, fontWeight:700 }}>
          ⏳ Сохраняем анкету...
        </div>
      )}
      {saveStatus === "ok" && (
        <div style={{ background:"#27ae60", color:"#fff", textAlign:"center", padding:"10px", fontSize:13, fontWeight:700 }}>
          ✅ Анкета успешно сохранена!
        </div>
      )}
      {saveStatus === "error" && (
        <div style={{ background:"#e84545", color:"#fff", textAlign:"center", padding:"10px", fontSize:13, fontWeight:700 }}>
          ⚠️ Ошибка сохранения. Проверьте интернет.
        </div>
      )}
      {view === "client"     && <ClientForm onSubmit={handleSubmit} />}
      {view === "family"     && <FamilyForm onSubmit={handleSubmit} />}
      {view === "adminLogin" && <AdminLogin onLogin={() => { setAuth(true); setView("admin"); }} />}
      {view === "admin" && auth && <AdminPanel submissions={submissions} loading={loading} onRefresh={loadSubmissions} onDelete={handleDelete} />}
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
