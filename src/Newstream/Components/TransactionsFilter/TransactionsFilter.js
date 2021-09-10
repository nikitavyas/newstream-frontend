import { Checkbox } from 'antd';
import React, { useState } from 'react';
import './TransactionsFilter.css';
import queryString from 'query-string';
import { withRouter } from 'react-router-dom';

let TransactionsFilter = (props) => {
	let params = queryString.parse(props.location.search);
	const [statusFilter, setStatusFilter] = useState(
		params.isPaid === 'true'
			? 'isPaid'
				? params.isPaid === 'false'
				: 'isUnPaid'
			: null
	);
	let pathname = props.location.pathname;
	let type = '';
	if (pathname.search('/transactions/') !== -1) {
		type = pathname.replace('/transactions/', '');
	}
	const onStatusFilter = (event) => {
		var url = new URL(window.location.href);
		var search_params = url.searchParams;
		if (event.length > 0) {
			event.map((data) => {
				if (event.length === 2) {
					search_params.delete('isPaid');
				} else if (data === 'isPaid') {
					search_params.set('isPaid', true);
				} else {
					search_params.set('isPaid', false);
				}
			});
		} else {
			search_params.delete('isPaid');
		}
		setStatusFilter(event);
		url.search = search_params.toString();
		// var new_url = url.toString();
		props.history.push('/transactions/' + type + url.search);
	};

	return (
		<div className="filterSection show">
			<div className="filter-card">
				<div className="filterByCatagory">
					<h6 className="">Filters</h6>
					<div className="filterbox border-0 pt-1">
						<h6>By Status</h6>
						<div className="d-flex flex-column">
							<div className="categories_list">
								<Checkbox.Group
									className="d-flex flex-column"
									onChange={(e) => onStatusFilter(e)}
									value={statusFilter}>
									<Checkbox key="1" name="type" value="isPaid">
										Paid Transactions
									</Checkbox>
									<Checkbox key="2" name="type" value="isUnPaid">
										Unpaid Transactions
									</Checkbox>
								</Checkbox.Group>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
TransactionsFilter = withRouter(TransactionsFilter);
export { TransactionsFilter };
