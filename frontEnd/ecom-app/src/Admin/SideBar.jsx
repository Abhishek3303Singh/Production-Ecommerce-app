import React from 'react'
import './style/sidebar.css'
import { Link } from 'react-router-dom';
import {TreeView, TreeItem} from '@material-ui/lab'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import PostAddIcon from '@material-ui/icons/PostAdd';
import LsitAltIcon from '@material-ui/icons/ListAlt'
import ImportExportIcon from '@material-ui/icons/ImportExport'
import DashboardIcon from '@material-ui/icons/Dashboard'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import RateReviewIcon from '@material-ui/icons/RateReview'
import AddBoxIcon from '@mui/icons-material/AddBox';
import {MdFilterBAndW} from 'react-icons/md'


const SideBar = () => {
  return (
    <>
    <div className="sidebar-container">
        <Link to='/'>
            <h2>FunHub</h2>
        </Link>
        <Link to = '/admin/dashboard'>
            <p>
                <DashboardIcon/>
                Overview
            </p>
        </Link>
        <Link>
        <TreeView
        defaultCollapseIcon={<ExpandMoreIcon/>}
        defaultExpandIcon={<ImportExportIcon/>} 
        >
            <TreeItem nodeId='1' label='Products'>
                <Link to='/admin/products'>
                    <TreeItem nodeId='2' label='All Products' icon={<PostAddIcon/>}/>
                </Link >
                <Link to='/admin/create/product'>
                    <TreeItem nodeId='3' label='Add Product' icon={<AddBoxIcon/>} />
                </Link>
                
            </TreeItem>
            
        </TreeView>

        </Link>
        <Link to='/admin/orders'>
            <p>
                <LsitAltIcon/>
                Orders
            </p>
        </Link>
        <Link to='/admin/users'>
            <p>
                <PeopleAltIcon/>
                Users
            </p>
        </Link>
        <Link to='/admin/reviews'>
            <p>
                <RateReviewIcon/>
                Reviews
            </p>
        </Link>

        <Link to='/admin/banner'>
            <p>
                <MdFilterBAndW/>
                Add Banner
            </p>
        </Link>
    </div>
    
    </>
  )
}

export default SideBar