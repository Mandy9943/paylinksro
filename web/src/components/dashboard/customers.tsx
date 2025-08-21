"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Copy,
  Download,
  BarChart3,
  Edit3,
  CreditCard,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const customerTabs = [
  { id: "all", label: "Toți", count: null },
  { id: "top", label: "Clienți top", count: null },
  { id: "first-time", label: "Clienți noi", count: null },
  { id: "repeat", label: "Clienți recurenți", count: null },
  { id: "recent", label: "Clienți recenți", count: null },
  { id: "high-refunds", label: "Rambursări multe", count: null },
  { id: "high-disputes", label: "Contestații multe", count: null }
];

const mockCustomers = [
  {
    name: "Mrs A Rosu",
    type: "Guest",
    email: "anamariacerap@yahoo.com",
    paymentMethod: { brand: "mastercard", last4: "4366" },
    created: "2 Aug, 12:51",
    totalSpend: "RON 348.81",
    payments: 1,
    refunds: "RON 0.00",
    disputeLosses: "RON 0.00",
    lastSeen: "2 Aug"
  },
  {
    name: "MISS G CRISAN",
    type: "Guest", 
    email: "geanina_crisan25@yahoo.com",
    paymentMethod: { brand: "visa", last4: "4744" },
    created: "1 Aug, 21:13",
    totalSpend: "RON 348.81",
    payments: 1,
    refunds: "RON 0.00",
    disputeLosses: "RON 0.00",
    lastSeen: "1 Aug"
  },
  {
    name: "Magdalena curylo",
    type: "Guest",
    email: "mcurlyjo78@gmail.com",
    paymentMethod: { brand: "visa", last4: "1941" },
    created: "29 Jul, 10:23",
    totalSpend: "RON 145.34",
    payments: 1,
    refunds: "RON 0.00",
    disputeLosses: "RON 0.00",
    lastSeen: "29 Jul"
  },
  {
    name: "Ramona Bocan",
    type: "Guest",
    email: "Andreea781@icloud.com",
    paymentMethod: { brand: "amex", last4: "1323" },
    created: "28 Jul, 15:47",
    totalSpend: "RON 290.68",
    payments: 1,
    refunds: "RON 0.00",
    disputeLosses: "RON 0.00",
    lastSeen: "28 Jul"
  },
  {
    name: "Mr S Vadeanu",
    type: "Guest",
    email: "vadeanu.sorin@gmail.com",
    paymentMethod: { brand: "visa", last4: "1673" },
    created: "21 Jul, 16:18",
    totalSpend: "RON 1,278.97",
    payments: 1,
    refunds: "RON 0.00",
    disputeLosses: "RON 0.00",
    lastSeen: "21 Jul"
  },
  {
    name: "Andrea Garcia Londono",
    type: "Guest",
    email: "andreg1995@hotmail.com",
    paymentMethod: { brand: "visa", last4: "7007" },
    created: "20 Jul, 00:40",
    totalSpend: "RON 174.41",
    payments: 1,
    refunds: "RON 0.00",
    disputeLosses: "RON 0.00",
    lastSeen: "20 Jul"
  },
  {
    name: "Desislava H Koeva",
    type: "Guest",
    email: "d.koeva79@gmail.com",
    paymentMethod: { brand: "visa", last4: "1621" },
    created: "17 Jul, 14:38",
    totalSpend: "RON 348.81",
    payments: 1,
    refunds: "RON 0.00",
    disputeLosses: "RON 0.00",
    lastSeen: "17 Jul"
  },
  {
    name: "Farshid Malecki",
    type: "Guest",
    email: "farshid_maleki2003@yahoo.com",
    paymentMethod: { brand: "visa", last4: "8251" },
    created: "15 Jul, 18:03",
    totalSpend: "RON 174.41",
    payments: 1,
    refunds: "RON 0.00",
    disputeLosses: "RON 0.00",
    lastSeen: "15 Jul"
  },
  {
    name: "Narcis Popa",
    type: "Guest",
    email: "popanarcis1987@yahoo.com",
    paymentMethod: { brand: "visa", last4: "5019" },
    created: "15 Jul, 10:32",
    totalSpend: "RON 877.84",
    payments: 2,
    refunds: "RON 0.00",
    disputeLosses: "RON 0.00",
    lastSeen: "17 Jul"
  },
  {
    name: "Razvan Marcocci",
    type: "Guest",
    email: "rmarco123@icloud.com",
    paymentMethod: { brand: "mastercard", last4: "3943" },
    created: "13 Jul, 16:51",
    totalSpend: "RON 348.81",
    payments: 1,
    refunds: "RON 0.00",
    disputeLosses: "RON 0.00",
    lastSeen: "13 Jul"
  },
  {
    name: "Vasile Sandu",
    type: "Guest",
    email: "sandumaya670@gmail.com",
    paymentMethod: { brand: "mastercard", last4: "1878" },
    created: "13 Jul, 16:16",
    totalSpend: "RON 872.03",
    payments: 1,
    refunds: "RON 0.00",
    disputeLosses: "RON 0.00",
    lastSeen: "13 Jul"
  },
  {
    name: "gheorghe baiculescu",
    type: "Guest",
    email: "marcobaiculescu@icloud.com",
    paymentMethod: { brand: "visa", last4: "5894" },
    created: "12 Jul, 14:22",
    totalSpend: "RON 174.41",
    payments: 1,
    refunds: "RON 0.00",
    disputeLosses: "RON 0.00",
    lastSeen: "12 Jul"
  },
  {
    name: "Regele Englez",
    type: "Guest",
    email: "englezu2018@hotmail.com",
    paymentMethod: { brand: "visa", last4: "1730" },
    created: "12 Jul, 10:52",
    totalSpend: "RON 174.41",
    payments: 1,
    refunds: "RON 0.00",
    disputeLosses: "RON 0.00",
    lastSeen: "12 Jul"
  }
];

type Method = { brand: string; last4: string };
function PaymentMethodIcon({ method }: { method: Method }) {
  if (method.brand === "visa") {
    return <div className="w-6 h-4 bg-blue-600 text-white text-xs font-bold flex items-center justify-center rounded">VISA</div>;
  }
  if (method.brand === "mastercard") {
    return <div className="w-6 h-4 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded">MC</div>;
  }
  if (method.brand === "amex") {
    return <div className="w-6 h-4 bg-green-600 text-white text-xs font-bold flex items-center justify-center rounded">AX</div>;
  }
  return <CreditCard className="w-4 h-4 text-gray-400" />;
}

export default function Customers() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 mb-1">Gestionează relațiile cu</p>
          <h2 className="text-xl font-semibold text-slate-900">Toți clienții</h2>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="gap-1.5 h-8 px-3 text-xs border-slate-200 hover:bg-slate-50">
            <Copy className="h-3.5 w-3.5" />
            Copiează
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 h-8 px-3 text-xs border-slate-200 hover:bg-slate-50">
            <Download className="h-3.5 w-3.5" />
            Exportă
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 h-8 px-3 text-xs border-slate-200 hover:bg-slate-50">
            <BarChart3 className="h-3.5 w-3.5" />
            Analizează
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 h-8 px-3 text-xs border-slate-200 hover:bg-slate-50">
            <Edit3 className="h-3.5 w-3.5" />
            Editează coloanele
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1 overflow-x-auto">
        {customerTabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap h-8 px-3 text-xs font-medium rounded-lg transition-all ${
              activeTab === tab.id 
                ? "bg-blue-600 text-white shadow-sm" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
            }`}
          >
            {tab.label}
          </Button>
        ))}
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100/70">
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </Button>
      </div>

      {/* Customers Table */}
      <Card className="border-0 shadow-sm bg-white">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-b border-slate-200/60">
                <TableHead className="text-xs font-medium text-slate-600 py-3 px-4">Nume</TableHead>
                <TableHead className="text-xs font-medium text-slate-600 py-3 px-4">Email</TableHead>
                <TableHead className="text-xs font-medium text-slate-600 py-3 px-4">Metoda de plată implicită</TableHead>
                <TableHead className="text-xs font-medium text-slate-600 py-3 px-4">Creat ↕</TableHead>
                <TableHead className="text-xs font-medium text-slate-600 py-3 px-4">Total cheltuit ↕</TableHead>
                <TableHead className="text-xs font-medium text-slate-600 py-3 px-4">Plăți ↕</TableHead>
                <TableHead className="text-xs font-medium text-slate-600 py-3 px-4">Rambursări ↕</TableHead>
                <TableHead className="text-xs font-medium text-slate-600 py-3 px-4">Pierderi din contestații ↕</TableHead>
                <TableHead className="text-xs font-medium text-slate-600 py-3 px-4">Ultima vizită</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCustomers.map((customer, index) => (
                <TableRow key={index} className={`border-b border-slate-100 hover:bg-slate-50/30 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/20'}`}>
                  <TableCell className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-slate-900 text-sm">{customer.name}</span>
                      <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600 border-0 px-2 py-0.5">
                        {customer.type === "Guest" ? "Invitat" : customer.type}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 py-3 px-4">
                    {customer.email}
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <PaymentMethodIcon method={customer.paymentMethod} />
                      <span className="text-xs text-slate-500">•••• {customer.paymentMethod.last4}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 py-3 px-4">
                    {customer.created}
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-slate-900 py-3 px-4">
                    {customer.totalSpend}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 py-3 px-4">
                    {customer.payments}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 py-3 px-4">
                    {customer.refunds}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 py-3 px-4">
                    {customer.disputeLosses}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 py-3 px-4">
                    {customer.lastSeen}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-3">
        <div className="text-xs text-slate-500">
          Afișare 1–10 din {mockCustomers.length} rezultate
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="h-8 px-3 text-xs border-slate-200 hover:bg-slate-50">
            <ChevronLeft className="w-3.5 h-3.5 mr-1" />
            Anterior
          </Button>
          <Button variant="outline" size="sm" className="h-8 px-3 text-xs border-slate-200 hover:bg-slate-50">
            Următorul
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}