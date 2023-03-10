# Балл за задание 620
### Бекенд на основе Firebase 55
- установка firebase в проект **5**
- настройка конфига firebase **5**
- создание удаленной базы данных на основе firebase **5**
- добавление возможности google авторизации в проект **5**
- авторизация при выборе соответствующего пункта меню **5**
- получение данных об авторизованном пользователе и добавление его id в модель **5**
- создание метода сохранения данных модели в базу данных **5**
- создание метода получения данных из базы данных и обновления полей модели **5**
- автосохранение состояния игрового поля, уровня, набранных баллов при прохождении уровня **5**
- автосохранение при выходе в главное меню **5**
- сохранение настроек игры в базу данных **5**

### Чит-попап 30
- **CTRL + SHIFT + L** - если пользователь находится в начальном меню - при нажатии этого сочетания клавиш появляется чит-попап, позволяющий ввести номер уровня, с которого пользователь хоел бы начать игру **5**
- **оформление и стилизация** - попап и его поля, в том числе форма, инпут, кнопка, стилистически оформлены, проработано состояние фокуса **5**
- **управление** - управление организовано с помощью стрелок клавиатуры **10**
- **проверка ввода** введенная в инпут информация должна быть числом, а также номер уровня ограничем двадцатым, это проверяется при вводе **10**

### Меню 60
- игровое меню, содержащее:
**start** - начало новой игры **10**
**continue** - продолжение автосохраненной игры **10**
**settings** - переход в меню настроек **5**
**leaderboard** - таблица хайскора **5**
**autorization** - авторизация с помощью google аккаунта по жалению пользователя (если пользователь не хочет авторизоваться, то его результат сохраняется в таблице лидеров под рандомно сгенерированным именем) **10**
- меню настроек,  **20** содержащее:
настройки клавиш навигации, выбора, установки бомбы регулятор громкости звука и кнопку отключения/включения звука, реагирующую на изменения значений регулятора громкоси
**! Важно !** Чтобы поменять кнопки управления в настройках нужно с помощью кнопок up и down перемеещаться по меню настроек вверх и вниз до тех пор, пока нужная кнопка не выделится стилем и слегка не замигает. После этого нужно нажать желаемую для установки кнопку и переместиться к следующей настройке. когда настройки будут завершены, следует переместиться к кнопке save и нажать enter. Если пользователь захочет изменить настройки когда-нибудь еще, то при следующем обращении к меню настроек ему следует пользоваться теми кнопками up и down для навигации по меню настроек, которые он указал в прошлый раз, а выбирать новые кнопки, если есть такая необходимость. В остальных меню для навигации всегда используются стрелки. Настройки пользователя относятся непосредственно к игровому полю приложения.

### Страницы 20
- страница пройденного уровня: появляется после прохождения уровня, даёт пользователю возможность перейти на новый уровень либо в главное игровое меню;  **10**
- страница начала уровня: появляется на короткое время перед началом нового уровня, содержит информацию о номере уровня;  **10**

### Хайскор 40
- запрашивает информацию обо всех пользователях из базы данных **10**
- извлекает нужные данные из полученной иинформации **10**
- сортирует достижения пользователей в порядке убывания **10**
- отображает актуальную таблицу лидеров **10**

### Стили: 30
- адаптивная верстка **5**
- стилизация выделенных элементов **5**
- тематическая стилизация элементов игрового поля; **10**
- винтажный шрифт; **5**
- подбор изображений и логотипов в стиле классической игры; **5**

### Музыка: 30
- фоновое аудио меню; **5**
- фоновое аудио игры; **5**
- звук начала нового уровня; **5**
- звук смерти персонажа; **5**
- звук взрыва бомбы; **5**
- звук перемещения персонажа по игровому полю; **5**

### Хедер игрового поля: 30
- набранные баллы; **10**
- количество жизней; **10**
- номер уровня **10**

### Игра 70
- Действие игры происходит на разных уровнях **10**
- Алгоритм рандомной генерации элементов игрового поля и врагов, игровое поле учитывает размер экрана пользователя **10**
- С увеличением уровня возрастает количество врагов, скорость движения врагов, скорость взрыва бомбы, каждые три уровня меняется размер игрового поля **20**
- Присутствует экран перехода на новый уровень **10**
- Победа и поражение сопровождаются соответствующими визуальными сообщениями и звуковыми сигналами **10**
- Анимация сотрясения игрового поля во время взрыва бомбы **10**

### Статистика 50
- Набранные баллы **10**
- Время прохождения игры **10**
- Количество жизней **10**
- Количество собранных бонусов **10**
- Номер уровня **10**

### Главный герой 40
- Создание главного героя и настройка его внешнего вида **10**
- Анимация движения героя по игровому полю **10**
- Возможность устанавливать бомбы **10**
- Возможность собирать бонусы и жизни **10**

### Противник 50
- Создание внешнего вида противника **10**
- Логика движения противника по игровому полю **10**
- Нанесения противником урона при столкновении с главным героем **10**
- Регулировка скорости движения противника **10**
- Настройка количества противников в зависимости от возрастающей сложности игры **10**

### Бомба 40
- Взравается через определленное время после установки **10**
- Уничтожает противника при попадании его в зону взрыва **10**
- Уничтожает героя при попадании его в зону взрыва **10**
- Взрывает деревянные блоки, но не действует на каменые **10**

### Бонусы 75
- Сердце – добавляет дополнительную жизнь **15**
- Красная бомба – бьёт на максимальное расстояние **15**
- Бронежилет – спасает от взрыва бомбы **15**
- Бомба х1 – увеличивает возможное количество установленных одновременно бомб **15**
- Красный шлем - включает режим "берсерк", дающий на 5 секунд неуязвимость, и позволяющий уничтожать врагов одним прикосновением. В режиме "берсерк" отключена возможность установки бомб **15**

Проект написан на TypeScript
