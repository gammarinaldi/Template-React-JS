import React, { Component } from 'react';
import axios from 'axios';
import { InputGroup, Row, Col } from 'reactstrap';
import { Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { API_URL_1 } from '../../supports/api-url/apiurl';
import Pagination from 'react-js-pagination';
import { select_products, onActivityLog, convertToRupiah, sortingJSON } from '../../actions';
import { 
    CATEGORY_GETLIST, 
    PRODUCTS_GETLIST, 
    PRODUCTS_GET, 
    LOCATION_GET, 
    CATEGORY_GET,
    PRODUCTS_EDIT, 
    PRODUCTS_DELETE, 
    LOCATION_GETLIST
} from '../../supports/api-url/apisuburl';
import moment from 'moment';

class ProductsListView extends Component {

    state = { 
                listProducts: [], 
                selectedIdEdit: 0, 
                searchListProducts: [], 
                filterForm: '', 
                value: '', 
                activePage: 1,
                itemPerPage: 5,
                listLocation: [],
                locationDetails: [],
                listCategory: [],
                listAllCategory: [],
                idLocation: 0,
                idCategory: 0
            }

    componentDidMount() {
        this.showProducts();
        this.showLocation();
        this.showCity();
        this.showCategory();
    }

    handlePageChange(pageNumber) {
        console.log(`active page is ${pageNumber}`);
        this.setState({activePage: pageNumber});
    }

    showCategory = () => {
        axios.get(API_URL_1 + CATEGORY_GETLIST)
        .then((res) => {
            console.log(res);
            this.setState({ 
                listCategory: res.data,
                listAllCategory: res.data
            });
        }).catch((err) => {
            console.log(err);
        })
    }

    getCategory = (idCategory) => {
        var listJSXCategory = this.state.listCategory.map((item) => {
           if(idCategory === item.id) {
               return item.name;
           } else return false;
        })
        return listJSXCategory;
    }

    renderAllCategory = () => {
        var listJSXAllCategory = this.state.listAllCategory.map((item) => {
            return (
                <option value={item.id}>{item.name}</option>
            )
        })
        return listJSXAllCategory;
    }

    showCity = () => {
        axios.get(API_URL_1 + LOCATION_GETLIST)
        .then((res) => {
            this.setState({ 
                locationDetails: res.data 
            });
            
        }).catch((err) => {
            console.log(err);
        })
    }

    getCity = (idLocation) => {
        var listJSXCity = this.state.locationDetails.map((item) => {
           if(idLocation === item.id) {
               return item.city;
           } else return false;
        })
        return listJSXCity;
    }

    showLocation = () => {
        axios.get(API_URL_1 + LOCATION_GETLIST)
        .then((res) => {
            this.setState({ 
                listLocation: res.data 
            });
        }).catch((err) => {
            console.log(err);
        })
    }

    renderListLocation = () => {
        var listJSXLocation = this.state.listLocation.map((item) => {
            return (
                <option value={item.id}>{item.city}</option>
            )
        })
        return listJSXLocation;
    }

    showProducts = () => {
        if(this.props.myRole === "ADMIN") {
            axios.get(API_URL_1 + PRODUCTS_GETLIST)
            .then((res) => {
                console.log(res);
                this.setState({ 
                    listProducts: res.data, 
                    searchListProducts: res.data, 
                    selectedIdEdit: 0 
                });
            }).catch((err) => {
                console.log(err);
            })
        } else if(this.props.myRole === "PRODUCER") {
            axios.post(API_URL_1 + PRODUCTS_GET, {
                creatorRole: 'PRODUCER', creatorName: this.props.username
            })
            .then((res) => {
                this.setState({ 
                    listProducts: res.data, 
                    searchListProducts: res.data, 
                    selectedIdEdit: 0 
                });
            }).catch((err) => {
                console.log(err);
            })
        }
    }

    onBtnSaveClick = (id) => {

        const category = this.refs.updateCategory.value;
        const location = this.refs.updateLocation.value;
        const item = this.refs.updateItem.value;
        const price = this.refs.updatePrice.value;
        const startDate = this.refs.updateStartDate.value;
        const endDate = this.refs.updateEndDate.value;

        axios.post(API_URL_1 + LOCATION_GET, {
            city: location
        }).then((res) => {
            this.setState({ 
                idLocation: res.data.id 
            });

            axios.post(API_URL_1 + CATEGORY_GET, {
                name: category
            }).then((res) => {
                this.setState({ 
                    idCategory: res.data.id
                });

                axios.put(API_URL_1 + PRODUCTS_EDIT + id, {
                    idCategory: this.state.idCategory, 
                    idLocation: this.state.idLocation,
                    img: this.state.listProducts.img,
                    item, price, startDate, endDate
                }).then((res) => {
                    //=======> Activity Log
                    this.props.onActivityLog({username: this.props.username, role: this.props.myRole, desc: 'Edit product: '+item});
                    this.showProducts();
                }).catch((err) => {
                    console.log(err);
                })

            }).catch((err) => {
                console.log(err);
            })

        }).catch((err) => {
            console.log(err);
        })
        
    }

    onBtnDeleteClick = (id, item) => {
        if(window.confirm(`Are you sure want to delete: ${item} ?`)) {
            axios.delete(API_URL_1 + PRODUCTS_DELETE + id)
            .then((res) => {
                //=======> Activity Log
                this.props.onActivityLog({username: this.props.username, role: this.props.myRole, desc: 'Delete product: '+item});
                this.showProducts();
            })
            .catch((err) => {
                console.log(err);
            })
        }
    }

    onKeyUpSearch = () => {
        var category = this.refs.qCategory.value;
        var location = this.refs.qLocation.value;
        var item = this.refs.qItem.value;
        var hargaMin = parseInt(this.refs.qHargaMin.value);
        var hargaMax = parseInt(this.refs.qHargaMax.value);

        if(location !== "" && category === "") {
            axios.post(API_URL_1 + LOCATION_GET, {
                id: location
            }).then((res) => {
                this.setState({ 
                    idLocation: res.data[0].id 
                });

                var arrSearch = this.state.listProducts.filter((e) => {
                    return      e.price >= hargaMin
                            &&  e.price <= hargaMax
                            &&  e.item.toLowerCase().includes(item.toLowerCase())
                            &&  e.idLocation === this.state.idLocation
                })
        
                this.setState({ searchListProducts: arrSearch })

            }).catch((err) => {
                console.log(err);
            })
        } else if(category !== "" && location === "") {
            axios.post(API_URL_1 + CATEGORY_GET, {
                id: category
            }).then((res) => {
                this.setState({ 
                    idCategory: res.data[0].id
                });
    
                var arrSearch = this.state.listProducts.filter((e) => {
                    return      e.price >= hargaMin
                            &&  e.price <= hargaMax
                            &&  e.item.toLowerCase().includes(item.toLowerCase())
                            &&  e.idCategory === this.state.idCategory
                })
        
                this.setState({ searchListProducts: arrSearch })
    
            }).catch((err) => {
                console.log(err);
            })
        } else if(location !== "" && category !== "") {
            axios.post(API_URL_1 + LOCATION_GET, {
                id: location
            }).then((res) => {
                this.setState({ 
                    idLocation: res.data[0].id 
                });

                axios.post(API_URL_1 + CATEGORY_GET, {
                    id: category
                }).then((res) => {
                    this.setState({ 
                        idCategory: res.data[0].id
                    });
        
                    var arrSearch = this.state.listProducts.filter((e) => {
                        return      e.price >= hargaMin
                                &&  e.price <= hargaMax
                                &&  e.item.toLowerCase().includes(item.toLowerCase())
                                &&  e.idCategory === this.state.idCategory
                                &&  e.idLocation === this.state.idLocation
                    })
            
                    this.setState({ searchListProducts: arrSearch })
        
                }).catch((err) => {
                    console.log(err);
                })
            }).catch((err) => {
                console.log(err);
            })
        } else if (category === "" && location === "") {
            var arrSearch = this.state.listProducts.filter((e) => {
                return      e.price >= hargaMin
                        &&  e.price <= hargaMax
                        &&  e.item.toLowerCase().includes(item.toLowerCase())
            })
    
            this.setState({ searchListProducts: arrSearch })
        }
    }

    onItemClick = () => {
        this.props.select_products(this.props.products);
    }

    renderListProducts = () => {
        var indexOfLastTodo = this.state.activePage * this.state.itemPerPage;
        var indexOfFirstTodo = indexOfLastTodo - this.state.itemPerPage;
        var sortedListProducts = this.state.searchListProducts.sort(this.props.sortingJSON('id', 'desc'));
        var renderedProjects = sortedListProducts.slice(indexOfFirstTodo, indexOfLastTodo);

        var listJSXProducts = renderedProjects.map((item, index) => {
            if(this.props.myRole === "ADMIN" || this.props.myRole === "PRODUCER") {
                return (
                    <tr key={index}>
                        <td><center>{item.id}</center></td>
                        <td><strong>
                            <Link to={`/admin/producteditdetails?id=${item.id}`} alt={item.item} 
                                title="Click to edit this item">{item.item}</Link>
                            </strong></td>
                        <td>{this.getCategory(item.idCategory)}</td>
                        <td>{this.getCity(item.idLocation)}</td>
                        <td>{this.props.convertToRupiah(item.price)}</td>
                        <td>
                            <center>
                            <a href={`${API_URL_1}${item.img}`} target="_blank" rel="noopener noreferrer">
                            <img src={`${API_URL_1}${item.img}`} alt={item.item} width={100} /></a>
                            </center>
                        </td>
                        <td>Start:<br/> {moment(item.startDate).format('D MMM YYYY')}<br/>End:<br/> {moment(item.endDate).format('D MMM YYYY')}</td>
                        <td>{item.creatorRole}</td>
                        <td>{item.creatorName}</td>
                        <td>
                            <center>
                                <button className="btn btn-danger"
                                    onClick={ () => this.onBtnDeleteClick(item.id, item.item) }>
                                    <i className="fa fa-trash fa-sm"></i>
                                </button>
                            </center>
                        </td>
                    </tr>
                )
            } else return false;

        })
        
        return listJSXProducts;
    }
        
    render() {
        
        if(this.props.username !== "" && (this.props.myRole === "ADMIN" || this.props.myRole === "PRODUCER")) {
            
            return(
                <div style={{ fontSize: "13px" }} className="card shadow p-3 mb-5 bg-white rounded">
                    <form id="searchForm">
                    <Row>
                        <Col lg="2">
                            <select ref="qCategory" className="form-control form-control-lg" style={{ fontSize: "12px" }}
                            onChange={() => {this.onKeyUpSearch()}}>
                                <option value="">All Category</option>
                                {this.renderAllCategory()}
                            </select>
                        </Col>
                        <Col lg="2">
                            <select ref="qLocation" className="form-control form-control-lg" style={{ fontSize: "12px" }}
                            onChange={() => {this.onKeyUpSearch()}}>
                                <option value="">All Location</option>
                                {this.renderListLocation()}
                            </select>
                        </Col>
                        <Col lg="2">
                            <input type="text" className="form-control form-control-lg" 
                            placeholder="Search by item" style={{ fontSize: "12px" }}
                            ref="qItem" onKeyUp={() => {this.onKeyUpSearch()}} />
                        </Col>
                        <Col lg="3">
                        <InputGroup>
                            <div class="input-group-prepend">
                                <div class="input-group-text">Rp</div>
                            </div>
                            <input type="number" className="form-control form-control-lg" 
                            ref="qHargaMin" defaultValue="0" style={{ fontSize: "12px" }}
                            onKeyUp={() => {this.onKeyUpSearch()}} />
                        </InputGroup>
                        </Col>
                        <Col lg="3">
                        <InputGroup>
                            <div class="input-group-prepend">
                                <div class="input-group-text">Rp</div>
                            </div>
                            <input type="number" className="form-control form-control-lg" 
                            ref="qHargaMax" defaultValue="99999999" style={{ fontSize: "12px" }} 
                            onKeyUp={() => {this.onKeyUpSearch()}} />
                        </InputGroup>
                        </Col>
                    </Row>
                    </form>
                    <br/>
                    <div className="table-responsive-lg">
                        <table className="table table-bordered table-hover">
                            <thead className="thead-dark">
                                <tr>
                                    <th><center>PID</center></th>
                                    <th><center>Item</center></th>
                                    <th><center>Category</center></th>
                                    <th><center>Location</center></th>
                                    <th><center>Price</center></th>
                                    <th><center>Image</center></th>
                                    <th><center>Schedule</center></th>
                                    <th><center>Creator Role</center></th>
                                    <th><center>Creator Name</center></th>
                                    <th><center>Action</center></th>
                                </tr>
                            </thead>
                            <tbody>
                                    {this.renderListProducts()}
                            </tbody>
                        </table>
                        <Pagination
                            activePage={this.state.activePage}
                            itemsCountPerPage={this.state.itemPerPage}
                            totalItemsCount={this.state.searchListProducts.length}
                            pageRangeDisplayed={5}
                            onChange={this.handlePageChange.bind(this)}
                        />
                    </div>
                </div>
            )
        } else {
            return (
                <Redirect to="/login" />
            )
        }
    }

}

const mapStateToProps = (state) => {
    return { username: state.auth.username, myRole: state.auth.role }
}

export default connect(mapStateToProps, { select_products, onActivityLog, convertToRupiah, sortingJSON })(ProductsListView);