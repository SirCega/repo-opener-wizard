import React, { useState, useEffect } from 'react';
import { useOrderService } from '@/hooks/useOrderService'; // Corregido - importar desde hooks, no desde services
import { Order } from '@/types/order-types';
import { Button, Table, Input, Space, Popconfirm, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import Link from 'next/link';

interface DataIndex {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}

const OrdersPage: React.FC = () => {
  const { orders, loading, error, getAllOrders } = useOrderService();
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [dataSource, setDataSource] = useState<Order[]>([]);

  useEffect(() => {
    if (orders) {
      // Ensure orders is not null or undefined
      setDataSource(orders);
    }
  }, [orders]);

  useEffect(() => {
    getAllOrders();
  }, []);

  const handleSearch = (selectedKeys: string[], confirm: (param?: any) => void, dataIndex: string) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (dataIndex: string): any => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value: any, record: any) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '',
    render: (text: any) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const columns: ColumnsType<Order> = [
    {
      title: 'Order Number',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: '12%',
      ...getColumnSearchProps('orderNumber'),
      sorter: (a: Order, b: Order) => a.orderNumber.localeCompare(b.orderNumber),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
      width: '15%',
      ...getColumnSearchProps('customer'),
      sorter: (a: Order, b: Order) => a.customer.localeCompare(b.customer),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: '10%',
      sorter: (a: Order, b: Order) => a.date.localeCompare(b.date),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      ...getColumnSearchProps('address'),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: '10%',
      sorter: (a: Order, b: Order) => a.total - b.total,
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '10%',
      filters: [
        {
          text: 'preparacion',
          value: 'preparacion',
        },
        {
          text: 'enviado',
          value: 'enviado',
        },
        {
          text: 'entregado',
          value: 'entregado',
        },
        {
          text: 'cancelado',
          value: 'cancelado',
        },
      ],
      onFilter: (value: string, record: Order) => record.status.indexOf(value) === 0,
    },
    {
      title: 'Action',
      key: 'action',
      render: (text: any, record: Order) => (
        <Space size="middle">
          <Link href={`/orders/${record.id}`}>
            <a>View</a>
          </Link>
          <a>Edit</a>
          <Popconfirm title="Sure to delete?" onConfirm={() => console.log('Delete')}>
            <a>Delete</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading) {
    return <p>Loading orders...</p>;
  }

  if (error) {
    return <p>Error loading orders: {error}</p>;
  }

  return (
    <div>
      <Typography.Title level={2}>Orders</Typography.Title>
      <Table dataSource={dataSource} columns={columns} rowKey="id" />
    </div>
  );
};

export default OrdersPage;
