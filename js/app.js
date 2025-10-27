$(function() {

    // === HAMBURGER MENU ===
    $('#x-menu').click(function() {
        $(this).toggleClass('open');
        $('.hide').toggleClass('show');
    });

    // === PREVENT DEFAULT ===
    $('ul li').on('click', function(e){
        e.preventDefault(); 
    });

    // === STAN APLIKACJI ===
    const currentState = { 
        sortColumn: 'id',
        sortOrder: 'asc',
        filter: "",
        page: 1,
        page_size: 20
    };

    const apiUrl = 'https://host175990.xce.pl/data.json'; // plik z danymi

    const sortingMethods = [
        {name: 'Id', sortColumn: 'id'},
        {name: 'Symbol', sortColumn: 'acronym'},
        {name: 'Opis', sortColumn: 'name'}
    ];

    // === FUNKCJE BUDUJĄCE ===
    const buildItem = (item) => (
        `<tr>
            <td>${item.id}</td>    
            <td>${item.acronym}</td>    
            <td>${item.name}</td> 
         </tr>`
    );

    const buildList = (items) => items.map(buildItem).join('');

    const buildHeaderItem = (item) => { 
        let sort = currentState.sortOrder;
        if (item.sortColumn === currentState.sortColumn) {
            sort = currentState.sortOrder === 'asc' ? 'desc' : 'asc';
        }
        return `<th>
            <a data-column="${item.sortColumn}" class="js-sort" href="#">${item.name}</a>
        </th>`;
    };

    const buildHeader = () => sortingMethods.map(buildHeaderItem).join('');

    // === ZMIENNE DANYCH ===
    let allData = []; // tu przechowujemy wszystkie rekordy z pliku JSON

    // === POBIERANIE DANYCH ===
    const getData = (url) => {
        $.ajax({
            type: 'GET',
            url: url,
            success: function(data) {
                if (typeof data === 'string') data = JSON.parse(data);
                allData = data;
                renderTable();
            },
            error: function() {
                alert("Problem z pobraniem danych");
            }
        });
    };

    // === RENDEROWANIE TABELI ===
    function renderTable() {
        let filtered = [...allData];

        // filtrowanie
        if (currentState.filter) {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(currentState.filter.toLowerCase()) ||
                item.acronym.toLowerCase().includes(currentState.filter.toLowerCase())
            );
        }

        // sortowanie
        filtered.sort((a, b) => {
            const col = currentState.sortColumn;
            const order = currentState.sortOrder === 'asc' ? 1 : -1;
            if (a[col] < b[col]) return -1 * order;
            if (a[col] > b[col]) return 1 * order;
            return 0;
        });

        // paginacja
        const start = (currentState.page - 1) * currentState.page_size;
        const end = start + currentState.page_size;
        const paged = filtered.slice(start, end);

        // renderowanie
        $('.js-results-list').empty().append(buildList(paged));
        $('.js-results-header').empty().append(buildHeader());

        // licznik stron
        $('.js-counter-page').html(currentState.page);
    }

    // === SORTOWANIE ===
    $(document).on('click', '.js-sort', function(e){
        e.preventDefault();
        const column = $(this).data('column');
        if (currentState.sortColumn === column) {
            currentState.sortOrder = currentState.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            currentState.sortColumn = column;
            currentState.sortOrder = 'asc';
        }
        renderTable();
    });

    // === FILTR ===
    $('.js-search-form').on('submit', function(e){
        e.preventDefault();
        currentState.filter = $('.js-search-form-filter').val();
        currentState.page = 1;
        renderTable();
    });

    // === PAGINACJA (POP / NEXT) ===
    $('.js-prev').on('click', function(e){
        e.preventDefault();
        if (currentState.page > 1) {
            currentState.page--;
            renderTable();
        }
    });

    $('.js-next').on('click', function(e){
        e.preventDefault();
        const totalPages = Math.ceil(allData.length / currentState.page_size);
        if (currentState.page < totalPages) {
            currentState.page++;
            renderTable();
        }
    });

    // === START ===
    getData(apiUrl);

});
