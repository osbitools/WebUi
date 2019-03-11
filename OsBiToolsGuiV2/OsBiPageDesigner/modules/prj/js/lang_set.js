/*
 * Open Source Business Intelligence Tools - http://www.osbitools.com/
 * 
 * Copyright 2014-2016 IvaLab Inc. and by respective contributors (see below).
 *
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 * Date: 2014-12-18
 *
 * Contributors:
 *
 */

// List of Project Manager Gui shared language labels
(function(osbi) {
  osbi.load_ll_set({
  
    LL_ENTITY : {
      "en" : "Entity",
      "fr" : "Entité",
      "ru" : "Объекта"
    },
  
    LL_LOADING_PROJECT_MANAGER : {
      'en' : "Loading Project Manager",
      'fr' : "Chef de projet en cours de chargement",
      'ru' : "Загрузка блока управления проектами"
    },
  
    LL_SELECT_PROJECT : {
      "en" : "Select Project",
      "fr" : "Projet Choisi",
      "ru" : "Выберите Проект"
    },
  
    LL_NEW : {
      "en" : "New",
      "fr" : "Nouveau",
      "ru" : "Новый"
    },
  
    LL_DATA_SOURCE : {
      "en" : "Data Source",
      "fr" : "Source de Données",
      "ru" : "Источник Данных"
    },
  
    LL_EDIT : {
      "en" : "Edit",
      "fr" : "Nouveau",
      "ru" : "Редактировать"
    },
  
    LL_SIGN_IN : {
      "en" : "Sign In",
      "fr" : "Signer Dans",
      "ru" : "Войти"
    },
  
    LL_PROJECT_NAME : {
      "en" : "Project Name",
      "fr" : "Nom du Projet",
      "ru" : "Имя Проекта"
    },
  
    LL_CREATE : {
      "en" : "Create",
      "fr" : "Créer",
      "ru" : "Создать"
    },
  
    LL_PROJ_NAME_REQ : {
      "en" : "The 'Project Name' is required.",
      "fr" : "Le «Nom du projet» est nécessaire.",
      "ru" : "'Имя Проекта' обязательное поле."
    },
  
    LL_PROJ_KEY_EXISTS : {
      "en" : "Project with name [key] already exists.",
      "fr" : "Projet avec le nom [key] existe déjà",
      "ru" : "Проекта' c именем [key] уже создан."
    },
  
    LL_CREATE_ENTITY : {
      "en" : "Create Entity",
      "fr" : "Créer Entité",
      "ru" : "Создать Объект"
    },
  
    LL_UPLOAD_ENTITY : {
      "en" : "Upload Entity",
      "fr" : "Ajouter Entité",
      "ru" : "Загрузить Объект"
    },
  
    LL_CREATE_FOLDER : {
      "en" : "Create Folder",
      "fr" : "Créer un Dossier",
      "ru" : "Создать Папку"
    },
  
    LL_FILE_NAME : {
      "en" : "File Name",
      "fr" : "Nom du Fichier",
      "ru" : "Имя Файла"
    },
  
    LL_FOLDER_NAME : {
      "en" : "Folder Name",
      "fr" : "Nom du Dossier",
      "ru" : "Имя Папки"
    },
  
    LL_FILE_NAME_REQ : {
      "en" : "The 'File Name' is required.",
      "fr" : "Le 'Nom de fichier' est nécessaire.",
      "ru" : "'Имя Файла' обязательное поле."
    },
  
    LL_ENTITY_NAME_EXISTS : {
      "en" : "Entity with name [fname] already exists.",
      "fr" : "Entité avec le nom [fname] existe déjà.",
      "ru" : "Объект c именем [fname] уже существует."
    },
  
    LL_ADD : {
      "en" : "Add",
      "fr" : "Ajouter",
      "ru" : "Добавить"
    },
  
    LL_REQUEST_PARAMETERS : {
      "en" : "Request Parameters",
      "fr" : "Demander Paramètres",
      "ru" : "Параметры Запроса"
    },
  
    LL_PARAMETER_NAME : {
      "en" : "Parameter Name",
      "fr" : "Nom du paramètre",
      "ru" : "Имя Параметра"
    },
  
    LL_JAVA_TYPE : {
      "en" : "Java Type",
      "fr" : "Java Type",
      "ru" : "Java Тип"
    },
  
    LL_SIZE : {
      "en" : "Size",
      "fr" : "Taille",
      "ru" : "Размер"
    },
  
    LL_FILE_PATH : {
      "en" : "File Path",
      "fr" : "Chemin du fichier",
      "ru" : "Путь к файлу"
    },
  
    LL_DELIMITER : {
      "en" : "Delimiter",
      "fr" : "Séparateur",
      "ru" : "Разграничитель"
    },
  
    LL_QUOTE_CHAR : {
      "en" : "Quote Char",
      "fr" : "Quote Char",
      "ru" : "Quote символ"
    },
  
    LL_ESCAPE_CHAR : {
      "en" : "Escape Char",
      "fr" : "Escape Char",
      "ru" : "Escape символ"
    },
  
    LL_SAVE : {
      "en" : "Save",
      "fr" : "Conserver",
      "ru" : "Сохранить"
    },
  
    LL_ERROR_FILE_NAME_EMPTY : {
      "en" : "File Name is empty",
      "fr" : "Nom de fichier est vide",
      "ru" : "Имя Файла пустое"
    },
  
    LL_ERROR_PARAMETER_NAME_EMPTY : {
      "en" : "Parameter Name is empty",
      "fr" : "Nom du paramètre est vide",
      "ru" : "Имя Параметра пустое"
    },
  
    LL_ERROR_JAVA_TYPE_NOT_SELECTED : {
      "en" : "Java Type is not selected",
      "fr" : "Java Type est pas sélectionné",
      "ru" : "Java Тип не выбран"
    },
  
    LL_SIZE_APPLIES_TO_STRING_ONLY : {
      "en" : "'Size' parameter apllies to Java Type 'String' only",
      "fr" : "'Taille' paramètre applique à 'String' (Chaîne) Java Type " +
                                                                  "seulement",
      "ru" : "Параметер 'Размер' может быть введен только с Java Типом " +
                                                        "'String' (Строка)"
    },
  
    LL_TEST_ENTITY : {
      "en" : "Test Entity",
      "fr" : "Test de l'entité",
      "ru" : "'Тестировать Объект'"
    },
  
    LL_ERROR_PARAM_NAME_ALREADY_EXIST : {
      "en" : "Parameter Name '[name]' already created",
      "fr" : "Nom du paramètre '[name]' already created",
      "ru" : "Параметер с именем '<param_name>' уже создан"
    },
  
    LL_ERROR_LOADING_PROJECT_LIST : {
      "en" : "Error Loading Project List",
      "fr" : "Erreur Liste des projets en cours de chargement",
      "ru" : "Ошибка загрузки списка проектов"
    },
  
    LL_ERROR_CREATING_PROJECT : {
      "en" : "Error Creating Project",
      "fr" : "Projet de Création d'erreur",
      "ru" : "Ошибка создания проекта"
    },
  
    LL_ERROR_LOADING_PROJECT : {
      "en" : "Error loading Project",
      "fr" : "Projet en cours de chargement d'erreur",
      "ru" : "Ошибка загрузки Проекта"
    },
  
    LL_ERROR_CREATING_ENTITY : {
      "en" : "Error creating Entity",
      "fr" : "Erreur de création de l'entité",
      "ru" : "Ошибка создания Объекта"
    },
  
    LL_RENAME_PROJECT : {
      "en" : "Rename Project",
      "fr" : "Renommer le Projet",
      "ru" : "Переименовать Проект"
    },
  
    LL_RENAME : {
      "en" : "Rename",
      "fr" : "Rebaptiser",
      "ru" : "Переименовать"
    },
  
    LL_ERROR_RENAMING_PROJECT : {
      "en" : "Error renaming Project",
      "fr" : "Projet de renommage d'erreur",
      "ru" : "Ошибка при переименования Проекта"
    },
  
    LL_DELETE_PROJECT : {
      "en" : "Delete Project",
      "fr" : "Supprimer le Projet",
      "ru" : "Удалить Проэкт"
    },
  
    LL_ERROR_DELETING_PROJECT : {
      "en" : "Error deleting Project",
      "fr" : "Erreur de suppression du Projet",
      "ru" : "Ошибка удаления Проекта"
    },
  
    LL_ERROR_FILE_UPLOAD: {
      "en": "File Upload Error",
      "fr": "File Upload Erreur",
      "ru": "Ошибка Загрузки Файла"
    },
  
    LL_ENTITY_NAME : {
      "en" : "Entity Name",
      "fr" : "Nom Entité",
      "ru" : "Имя Объекта"
    },
  
    LL_LOAD : {
      "en" : "Load",
      "fr" : "Charge",
      "ru" : "Загрузить"
    },
  
    LL_CONFIRM_ENTITY_CHANGES_CANCEL : {
      "en" : "Last Entity changes will be lost.\nPlease confirm",
      "fr" : "Derniers changements entité sera perdu." +
                                              "\nS'il vous plaît confirmer",
      "ru" : "Последние изменения для Объекта будут утеряны." +
                                                  "\nПожалуйста подтвердите."
    },
  
    LL_ERROR_SAVE_ENTITY : {
      "en" : "Error save Entity",
      "fr" : "Erreur enregistrer Entité",
      "ru" : "Ошибка сохранения Объекта"
    },
  
    LL_RENAME_ENTITY : {
      "en" : "Rename Entity",
      "fr" : "Renommez Entité",
      "ru" : "Переименовать Объект"
    },
  
    LL_DELETE_ENTITY : {
      "en" : "Delete Entity",
      "fr" : "Supprimer Entité",
      "ru" : "Удалить Объект"
    },
  
    LL_ERROR_RENAMING_ENTITY : {
      "en" : "Error renaming Entity",
      "fr" : "Erreur renommer Entité",
      "ru" : "Ошибка переименования Объекта"
    },
  
    LL_ERROR_DELETING_ENTITY : {
      "en" : "Error deleting Entity",
      "fr" : "Erreur de suppression Entité",
      "ru" : "Ошибка удаления Объекта"
    },
  
    LL_ERROR_LOADING_ENTITY : {
      "en" : "Error loading Entity",
      "fr" : "Erreur lors du chargement Entité",
      "ru" : "Ошибка загрузки Объекта"
    },
  
    LL_ERROR_INVALID_DATA : {
      "en" : "Invalid data",
      "fr" : "Données invalides",
      "ru" : "Неверные данные"
    },
  
    LL_ERROR_CHECK_FILE : {
      "en" : "Error checking file",
      "fr" : "Erreur fichier de vérification",
      "ru" : "Ошибка при проверке файла"
    },
  
    LL_CONFIRM_FILE_OVERWRITE : {
      "en" : "[fname] already exist. Overwrite ?",
      "fr" : "[fname] existent déjà. Écraser ?",
      "ru" : "[fname] уже существует. Перезаписать ?"
    },
  
    LL_ERROR_LOADING_PROJECT_METADATA : {
      "en" : "Error loading Project Metadata",
      "fr" : "Erreur lors du chargement Métadonnées des Projets",
      "ru" : "Ошибка загрузки Метаданных Проекта"
    },
  
    LL_SELECT_CSV_FILE : {
      "en" : "Select CSV File",
      "fr" : "Sélectionnez un Fichier CSV",
      "ru" : "Выберите CSV Файл"
    },
  
    LL_ERROR_DOWNLOAD_CSV_FILE : {
      "en" : "Error downloading CSV file",
      "fr" : "Sélectionnez un fichier CSV",
      "ru" : "Ошибка загрузки CSV файла"
    },
  
    LL_COMMIT : {
      "en" : "Commit",
      "fr" : "Commettre",
      "ru" : "Зафиксировать"
    },
  
    LL_ERROR_COMMIT_ENTITY : {
      "en" : "Error commiting Entity",
      "fr" : "Erreur commettre Entité",
      "ru" : "Ошибка фиксации Объекта"
    },
  
    LL_COMMIT_MESSAGE : {
      "en" : "Commit Message",
      "fr" : "Message de Commit",
      "ru" : "Комментарии изменения"
    },
  
    LL_COMMIT_MESSAGE_REQUIRED : {
      "en" : "Commit message required",
      "fr" : "Commit message requis",
      "ru" : "Комментарии для фиксации версии обязательны"
    },
  
    LL_CHANGE_LOG : {
      "en" : "Change Log",
      "fr" : "Journal de Modification",
      "ru" : "Журнал Изменений"
    },
  
    LL_ERROR_GET_CHANGE_LOG : {
      "en" : "Error getting change log",
      "fr" : "Erreur d'obtention journal de modification",
      "ru" : "Ошибка получения журнала изменений"
    },
  
    LL_COMMIT_DTS : {
      "en" : "Commit Date",
      "fr" : "Date de Commettre",
      "ru" : "Дата Изменения"
    },
  
    LL_ERROR_GET_REVISION : {
      "en" : "Error receiving revision",
      "fr" : "Erreur révision recevoir",
      "ru" : "Ошибка получения зафиксированной версии"
    },
  
    LL_LOAD_CURRENT : {
      "en" : "Load Current",
      "fr" : "Courant de charge",
      "ru" : "Загрузить текущий файл"
    },
  
    LL_PARAMETER_VALUE : {
      "en" : "Parameter Value",
      "fr" : "Paramètre Valeur",
      "ru" : "Значение Параметра"
    },
  
    LL_PARAMETER : {
      "en" : "Parameter",
      "fr" : "Paramètre",
      "ru" : "Параметр"
    },
  
    LL_ERROR_UPLOAD_ENTITY : {
      "en" : "Error uploading new Object",
      "fr" : "Erreur téléchargeant un nouveau Entité",
      "ru" : "Ошибка выгрузки нового Объекта"
    },
  
    LL_FILE_WITH_EXT_REQUIRED : {
      "en" : "File with extension '[ext]' required",
      "fr" : "Fichier avec l'extension '[ext]' requis",
      "ru" : "Требуется файл с расширением '[ext]'"
    },
  
    LL_ERROR_DOWNLOAD_ENTITY : {
      "en" : "Error downloading Entity",
      "fr" : "Erreur de téléchargement Entité",
      "ru" : "Ошибка загрузки Объекта"
    },
  
    LL_GIT_PUSH : {
      "en" : "Git Push",
      "fr" : "Git Push",
      "ru" : "Git Push"
    },
  
    LL_ERROR_EXEC_GIT_PUSH : {
      "en" : "Error during Git Push execution",
      "fr" : "Erreur lors de l'exécution de Git Push",
      "ru" : "Ошибка при выполнении Git Push"
    },
  
    LL_ERROR_GIT_PUSH_SUCCESS : {
      "en" : "Git Push execution successful",
      "fr" : "Exécution Git Push réussie",
      "ru" : "Git Push выполнен успешно"
    },
  
    LL_PROPERTIES : {
      "en" : "Properties",
      "fr" : "Propriétés",
      "ru" : "Свойства"
    },
  
    NEW_ENTITY_BODY_MSG : {
      "en" : "Drag &amp; Drop Component Icon here",
      "fr" : "Drag &amp; Goutte Icône Composant ici",
      "ru" : "Перетащить и бросить значок компоненты сюда"
    },
  
    LL_ERROR_INVALID_CORRUPTED_ENTITY : {
      "en" : "Invalid or corrupted Entity",
      "fr" : "Invalide ou corrompu Entité",
      "ru" : "Неверный или поврежденный Объект"
    },
  
    LL_COLUMN_NAME : {
      "en" : "Column Name",
      "fr" : "Nom de la Colonne",
      "ru" : "Имя Колонки"
    },
  
    LL_COLUMN_TYPE : {
      "en" : "Column Type",
      "fr" : "Type de Colonne",
      "ru" : "Тип Колонки"
    },
  
    LL_REFRESH : {
      "en" : "Refresh",
      "fr" : "Rafraichissement",
      "ru" : "Обновить"
    },
  
    LL_RESULT_ON_ERROR : {
      "en" : "Result On Error",
      "fr" : "Résultat On Error",
      "ru" : "Результат При Ошибке"
    },
  
    LL_DESCRIPTION : {
      "en" : "Description",
      "fr" : "Description",
      "ru" : "Описание"
    },
  
    LL_PROPERTIES_NOT_SAVED : {
      "en" : "Properties not saved",
      "fr" : "Propriétés pas enregistrées",
      "ru" : "Свойства не сохранены"
    },
    
    LL_LANG_LABELS: {
     "en": "International Labels",
     "fr": "Labels Internationaux",
     "ru": "Международные Ярлыки"
    },
    
    LL_LABEL_ID: {
     "en": "Label Id",
     "fr": "Label Id",
     "ru": "Код Ярлыка"
    },
    
    LL_RPOJ_LANG_LABELS_EDITOR: {
      "en": "Project International Labels Editor",
      "fr": "Projet International Labels Éditeur",
      "ru": "Редактирование Международных Ярлыков Проекта"
    },
    
    LL_UNDO: {
      "en": "Undo",
      "fr": "Défaire",
      "ru": "Вернуть"
    },
    
    LL_ERROR_READ_CUSTOM_LANG_LABELS: {
      "en": "Error reading project international labels",
      "fr": "Projet erreur de lecture de labels internationaux",
      "ru": "Ошибка чтения международных ярлыков проекта"
    },
     
    LL_ADD_NEW_LANG_LABEL: {
      "en": "Add New International Label",
      "fr": "Ajouter de label New International",
      "ru": "Добавить Новый Международный Ярлык"
    },
    
    LL_INVALID_LABEL_ID_FORMAT: {
      "en": "Invalid Label Id format",
      "fr": "Format ID valide Label",
      "ru": "Неправильный формат кода ярлыка"
    },
   
    LL_ERROR_SAVE_CUSTOM_LL_SET: {
      "en": "Error saving custom language labels",
      "fr": "Erreur de sauvegarde des étiquettes de langue personnalisé",
      "ru": "Ошибка сохранения пользовательских меток языка"
    },
   
    LL_ERROR_SERVER_LL_SET_VERSION_NOT_SUPPORTED: {
      "en": "Server version for language labels is higher than supported",
      "fr": "Server version pour les étiquettes de langues est " +
                                                    "supérieur supporté",
      "ru": "Версия сервера для языковых меток выше, чем поддерживается"
    }

    /*
    LL_: {
      "en": "",
      "fr": "",
      "ru": ""
    }
    */
  });
})(jOsBiTools);
