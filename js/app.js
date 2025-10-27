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

    // === POMOCNICZE: ZWRACA PRZEFILTROWANE DANE (BEZ PAGINACJI) ===
    function getFiltered() {
        let filtered = [...allData];
        if (currentState.filter && currentState.filter.trim() !== '') {
            const f = currentState.filter.toLowerCase();
            filtered = filtered.filter(item =>
                (item.name && item.name.toLowerCase().includes(f)) ||
                (item.acronym && item.acronym.toLowerCase().includes(f))
            );
        }
        return filtered;
    }

    // === RENDEROWANIE TABELI ===
    function renderTable() {
        let filtered = getFiltered();

        // sortowanie
        filtered.sort((a, b) => {
            const col = currentState.sortColumn;
            const order = currentState.sortOrder === 'asc' ? 1 : -1;
            // safety: handle undefined values
            const va = (a[col] === undefined || a[col] === null) ? '' : a[col];
            const vb = (b[col] === undefined || b[col] === null) ? '' : b[col];
            if (va < vb) return -1 * order;
            if (va > vb) return 1 * order;
            return 0;
        });

        // paginacja - upewnij się, że page nie przekracza max
        const totalPages = Math.max(1, Math.ceil(filtered.length / currentState.page_size));
        if (currentState.page > totalPages) currentState.page = totalPages;
        if (currentState.page < 1) currentState.page = 1;

        const start = (currentState.page - 1) * currentState.page_size;
        const end = start + currentState.page_size;
        const paged = filtered.slice(start, end);

        // renderowanie
        $('.js-results-list').empty().append(buildList(paged));
        $('.js-results-header').empty().append(buildHeader());

        // licznik stron
        $('.js-counter-page').html(currentState.page);
        // (opcjonalnie) pokaż też ile stron jest:
        $('.js-counter-total').html(totalPages);
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
        currentState.page = 1;
        renderTable();
    });

    // === FILTR: submit oraz natychmiastowe reagowanie przy wpisywaniu ===
    $('.js-search-form').on('submit', function(e){
        e.preventDefault();
        currentState.filter = $('.js-search-form-filter').val().trim();
        currentState.page = 1;
        renderTable();
    });

    // reaguj natychmiast na zmianę inputa (usuwa konieczność klikania submit)
    $('.js-search-form-filter').on('input', function(){
        currentState.filter = $(this).val().trim();
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
        const totalPages = Math.max(1, Math.ceil(getFiltered().length / currentState.page_size));
        if (currentState.page < totalPages) {
            currentState.page++;
            renderTable();
        }
    });

    // === START ===
    getData(apiUrl);

});
