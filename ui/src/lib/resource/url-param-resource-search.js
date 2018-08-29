import React, {Component} from 'react'
import PropTypes from 'prop-types'
import { observer, Observer } from 'mobx-react'
import { observable, action, computed} from 'mobx'
import { hot } from 'react-hot-loader'
import ReactTable from 'react-table'

import ResourceBasedComponent from './resource-based-component'
import SelectComponent from '../../components/table-extensions/select-input'
import RowComponent from '../../components/table-extensions/row'

@observer
class UrlParamResourceSearch extends ResourceBasedComponent {
  
  static propTypes = {
    resource: PropTypes.string.isRequired,
    fieldsToSearch: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.PropTypes.object // MobX Observable array is not an array.
    ]).isRequired,
    columnDef: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.object),
      PropTypes.PropTypes.object // MobX Observable array is not an array.
    ]).isRequired
  }
  
  @observable
  columnDef = []
  
  @action.bound
  selectToggle = (id) => {
    (this.selections.has(id) && this.selections.delete(id)) || this.selections.set(id, true)
  }
  
  @observable
  selections = new Map()

  constructor (props) {
    super(props)
    this.updateStateFromParams()
    this.selections = new Map()
    
    // Add the selection box.
    const select = {
      id: '_selector',
      accessor: () => 'x', // this value is not important
      Header: "",
      Cell: (ci) => {
        return <SelectComponent row={ci.original} selections={this.selections} selectToggle={this.selectToggle} />
      },
      width: 30,
      filterable: false,
      sortable: false,
      resizable: false,
      style: { textAlign: 'center' }
    }
    
    this.columnDef = [
      select,
      ...props.columnDef,
    ];
  }

  rowComponent = (props) => (<RowComponent selections={this.selections} isCurrent={this.props.isCurrent} currentIdToggle={this.props.currentIdToggle} {...props} />)
  
  @action.bound
  updateStateFromParams = (urlPars) => {
    urlPars = urlPars || this.app.queryStringObject
    let num
    if (urlPars.perPage) {
      num = parseInt(urlPars.perPage)
      this.perPage = (num === NaN ? 10 : num)
    }
    if (urlPars.page) {
      num = parseInt(urlPars.page)
      this.page = (num === NaN ? 10 : num)
    }
  }
  
  @observable perPage = 10
  @observable page = 1
  @observable totalPages = 1
  @observable total = 0
  
  path = null
  
  @action.bound
  updateParamsFromUrl = (location) => {

    if (!location || location.pathname == this.path) {

      let urlPars = this.app.queryStringObject
      this.updateStateFromParams(urlPars)
      
      // Constant params to feed to the backend.
      const constants = {
        stats: true, // This asks the backend to supply search stats. Page, totals etc.
        perPage: this.perPage,
        page: this.page
      }

      let newParams = Object.assign({}, this.fetchParams, urlPars, constants)
      if (newParams.term) {
        newParams.match = this.props.fieldsToSearch
      }

      this.fetchParams = newParams
    }

    this.path = (location || window.location).pathname
  }

  stopListening = null
  componentWillUnmount() {
    if ( typeof this.stopListening == 'function' ) {
      this.app.log('Removing URL listener')
      this.stopListening()
      this.stopListening = null
    }
  }

  @computed get responseData() {
    if (this.data) {
      return this.data.body().data()
    } 

    return {}
  }
  
  /**
   * The results, although a collection come though as an object. With state information and the results as a property.
   */
  contextObjectCallback = (theType) => {
    
    let theTarget = this.app.api.custom(theType)
    return theTarget
  }
  
  remoteDataCallback = (dataContext, parameters) => {
    let results = dataContext.get(parameters)
    return results
  }
  
  onDataFetched() {
    let num
    if (this.responseData.perPage) {
      num = parseInt(body.perPage)
      this.perPage = (num === NaN ? 10 : num)
    }
    
    if (this.responseData.page) {
      num = parseInt(this.responseData.page)
      this.page = (num === NaN ? 1 : num)
    }

    if (this.responseData.totalPages) {
      num = parseInt(this.responseData.totalPages)
      this.totalPages = (num === NaN ? 1 : num)
    }
    
    if (this.responseData.total) {
      num = parseInt(this.responseData.total)
      this.total = (num === NaN ? 0 : num)
    }
  }
  
  @computed get tableRows() {    
    return this.responseData.results ? this.responseData.results.map((entity) => {
      return entity
    }) : []
  }
  
  fetchTableData = (state) => {
    
    if (typeof this.stopListening !== 'function') {

      // We init data first.
      this.updateParamsFromUrl()
      this.app.log('Adding URL listener')
      this.stopListening = this.app.addHistoryListener(this.updateParamsFromUrl)
      
    } else {
      
      // This is a table change not startup.
      if (this.app && state) {
        
        let params = Object.assign({term : this.fetchParams.term}, {
          perPage : state.pageSize,
          page: state.page + 1,
          sort: state.sorted.map((sort => (`${sort.id};${sort.desc ? 'desc' : 'asc'}`)))
        })
        
        this.app.addToQueryString( params )
      }
    }
  }
  
  render() {
    
    let paginate = true
    let minRows = (!this.tableRows.length || this.tableRows.length < 1 ? 5 : this.tableRows.length) 
    let fromRes = ((this.page - 1) * this.perPage) + 1
    let toRes = (fromRes + this.tableRows.length - 1)
    
    return (
      <ReactTable
        columns={this.columnDef.slice()}
        noDataText="No results found"
        manual // Forces table not to paginate or sort automatically, so we can handle it server-side
        showPagination={paginate}
        showPaginationBottom={paginate}
        showPageSizeOptions={paginate}
        minRows={minRows}
        data={this.tableRows}
        pages={this.totalPages} // Display the total number of pages
        defaultPageSize={this.perPage}
        loading={this.working} // Display the loading overlay when we need it
        onFetchData={this.fetchTableData} // Request new data when things change
        className="-striped -highlight"
        TrComponent={this.rowComponent}
      
      
        // Special property generators.
        getTrProps= {(state, rowInfo, column) => (rowInfo ? {
          // Get the column info.
          row: rowInfo.original
        } : {})}
          
          >{(state, makeTable, instance) => {
            let results = state.data.length < 1 ? 'No results found' : `Showing results ${fromRes} to ${toRes} of ${this.total}`
            return (
              <div>
                <h2>{results}</h2>
                {makeTable()}
              </div>
            )
          }}
      </ReactTable>
    )
  }
}

export default hot(module)(UrlParamResourceSearch)
