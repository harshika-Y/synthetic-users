import React from 'react';
import { 
  X, Printer, CheckCircle2, MapPin, Phone, Mail, 
  Clock, ShieldCheck, UtensilsCrossed, Sparkles, Bike, Receipt
} from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';

const BillModal = () => {
  const { isBillOpen, setIsBillOpen, activeBillOrder } = useCustomer();

  if (!isBillOpen || !activeBillOrder) return null;

  const order = activeBillOrder;
  const bill = order.bill || {};
  const delivery = order.deliveryDetails || {};
  const customer = order.customer || {};

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[120] flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div 
        className="w-full max-w-2xl rounded-2xl border relative overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200"
        style={{
          backgroundColor: '#07261D',
          borderColor: 'rgba(52, 211, 153, 0.35)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.95), 0 0 40px rgba(52, 211, 153, 0.15)',
          color: '#FFFFFF'
        }}
      >
        {/* Top Controls Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#041A13]/90">
          <div className="flex items-center gap-2 text-xs font-mono text-[#34D399]">
            <Receipt className="w-4 h-4 text-[#34D399]" />
            <span>OFFICIAL TAX INVOICE & BILL OF ITEMS</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all cursor-pointer"
              title="Print Bill / Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Bill</span>
            </button>
            <button
              onClick={() => setIsBillOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Bill Content */}
        <div className="p-6 md:p-8 space-y-6 max-h-[82vh] overflow-y-auto printable-area">
          
          {/* Success Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#0E4634] to-[#07261D] border border-[#34D399]/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#34D399]/20 border border-[#34D399] flex items-center justify-center text-[#34D399]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Order Confirmed & Bill Generated</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#34D399]/20 text-[#34D399] font-mono">
                    LIVE
                  </span>
                </h3>
                <p className="text-xs text-[#E6F4EA]/80">
                  Data stored exclusively in your Google account ({customer.email})
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-white/60 uppercase tracking-wider block font-mono">Order ID</span>
              <span className="text-sm font-bold text-[#34D399] font-mono">{order.id}</span>
            </div>
          </div>

          {/* Restaurant Header */}
          <div className="text-center border-b border-white/15 pb-5">
            <div className="flex justify-center items-center gap-3 mb-2">
              <img src="/logo.png" alt="Kadappa Cafe" className="h-14 w-auto" />
            </div>
            <h1 className="text-xl font-bold tracking-wider uppercase font-mono text-white">
              KADAPPA CAFE
            </h1>
            <p className="text-xs text-[#E6F4EA]/80 font-sans mt-0.5">
              Authentic South Indian Heritage Flavours & Express Delivery
            </p>
            <p className="text-[11px] text-[#A0B3A6] mt-1 font-mono">
              Nuagan Tech Corridor, Outer Ring Road, Bengaluru - 560103 | +91 80 4920 1826
            </p>
            <div className="flex items-center justify-center gap-4 text-[10px] text-[#34D399] font-mono mt-1.5">
              <span>FSSAI: {order.fssaiLicense || '11224334000189'}</span>
              <span>•</span>
              <span>GSTIN: {order.gstin || '29AAACK1234F1Z8'}</span>
            </div>
          </div>

          {/* Metadata Grid: Customer Google Details & Delivery Destination */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-[#041A13]/80 p-4 rounded-xl border border-white/10">
            {/* Customer Details (Google Account) */}
            <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-white/10 pb-3 md:pb-0 md:pr-4">
              <span className="text-[10px] uppercase font-bold text-[#34D399] tracking-wider block">
                Google Customer Identity
              </span>
              <p className="font-bold text-white text-sm flex items-center gap-1.5">
                <span>{customer.name || 'Valued Foodie'}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  Google Verified
                </span>
              </p>
              <p className="text-white/80 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#34D399]" />
                <span>{customer.email}</span>
              </p>
              <p className="text-white/90 font-semibold flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#34D399]" />
                <span>+91 {delivery.phone}</span>
              </p>
              <div className="text-[10px] text-white/50 pt-1">
                Date: {new Date(order.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} at {new Date(order.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {/* Delivery Destination */}
            <div className="space-y-1.5 md:pl-2">
              <span className="text-[10px] uppercase font-bold text-[#34D399] tracking-wider block">
                Delivery Destination
              </span>
              <p className="text-white font-medium flex items-start gap-1.5 leading-snug">
                <MapPin className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5" />
                <span>
                  {delivery.addressLine}, {delivery.area}, {delivery.city} - <span className="font-mono font-bold">{delivery.pincode}</span>
                </span>
              </p>
              {delivery.instructions && (
                <p className="text-[11px] text-[#A0B3A6] italic pl-5">
                  Note: "{delivery.instructions}"
                </p>
              )}
              <div className="pt-1.5 pl-5">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/90 font-mono inline-block">
                  Payment: {order.paymentMethod || 'UPI / Google Pay'}
                </span>
              </div>
            </div>
          </div>

          {/* ITEM BILL OF ITEMS TABLE */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <UtensilsCrossed className="w-3.5 h-3.5 text-[#34D399]" />
                <span>Itemized Bill of Items</span>
              </h4>
              <span className="text-[10px] font-mono text-white/60">
                {order.items?.length || 0} unique item(s)
              </span>
            </div>

            <div className="border border-white/15 rounded-xl overflow-hidden bg-[#041A13]/60">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-[#0E4634]/60 border-b border-white/15 text-[#E6F4EA]/80 font-mono text-[11px]">
                    <th className="py-2.5 px-3 w-8">#</th>
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3 text-center w-16">Veg</th>
                    <th className="py-2.5 px-3 text-right w-20">Rate</th>
                    <th className="py-2.5 px-3 text-center w-16">Qty</th>
                    <th className="py-2.5 px-3 text-right w-24">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-white">
                  {order.items?.map((item, idx) => {
                    const itemTotal = (item.price * item.quantity).toFixed(2);
                    return (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-3 text-white/50 font-mono text-[11px]">{idx + 1}</td>
                        <td className="py-3 px-3">
                          <p className="font-semibold text-white">{item.name}</p>
                          {item.category && (
                            <span className="text-[10px] text-[#A0B3A6] block">{item.category}</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-flex items-center justify-center w-4 h-4 border border-emerald-500 rounded-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-white/80">
                          ₹{item.price.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-[#34D399]">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-white">
                          ₹{itemTotal}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* FINANCIAL SUMMARY / TAX BREAKDOWN */}
          <div className="bg-[#041A13]/90 rounded-xl p-4 border border-white/15 space-y-2 text-xs">
            <div className="flex justify-between text-white/80">
              <span>Items Subtotal</span>
              <span className="font-mono font-semibold text-white">₹{bill.subtotal?.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-white/80">
              <span>Eco-Packaging & Fresh Container Charge</span>
              <span className="font-mono font-semibold text-white">₹{bill.packagingFee?.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-white/80">
              <span className="flex items-center gap-1.5">
                <span>Express 30-Min Hot Delivery</span>
                {bill.deliveryFee === 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-[#34D399] font-mono">
                    FREE (&gt;₹299)
                  </span>
                )}
              </span>
              <span className="font-mono font-semibold text-white">
                {bill.deliveryFee === 0 ? '₹0.00' : `₹${bill.deliveryFee?.toFixed(2)}`}
              </span>
            </div>

            <div className="flex justify-between text-white/60 text-[11px] pt-1 border-t border-white/10">
              <span>CGST (2.5%)</span>
              <span className="font-mono">₹{bill.cgst?.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-white/60 text-[11px]">
              <span>SGST (2.5%)</span>
              <span className="font-mono">₹{bill.sgst?.toFixed(2)}</span>
            </div>

            {bill.discount > 0 && (
              <div className="flex justify-between text-[#34D399] font-semibold">
                <span>Special Promotional Discount {bill.couponCode ? `(${bill.couponCode})` : ''}</span>
                <span className="font-mono">-₹{bill.discount?.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-sm font-bold text-white pt-2.5 border-t border-white/20">
              <div>
                <span className="uppercase tracking-wider">Net Amount Payable</span>
                <span className="text-[10px] font-normal text-[#E6F4EA]/70 block">
                  (Inclusive of all taxes & delivery fees)
                </span>
              </div>
              <span className="text-xl font-mono text-[#34D399] font-bold">
                ₹{bill.grandTotal?.toFixed(2)}
              </span>
            </div>
          </div>

          {/* LIVE DELIVERY SIMULATOR STATUS */}
          <div className="p-4 rounded-xl bg-[#06261C] border border-[#34D399]/30 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-white">
              <div className="flex items-center gap-2">
                <Bike className="w-4 h-4 text-[#34D399] animate-pulse" />
                <span>Live Delivery Status</span>
              </div>
              <span className="text-[11px] text-[#34D399] font-mono">
                Estimated Delivery: 22 Mins
              </span>
            </div>

            {/* Step Track */}
            <div className="grid grid-cols-4 gap-2 text-[10px] text-center font-mono">
              <div className="p-2 rounded bg-[#0E4634] text-[#34D399] border border-[#34D399]/40">
                <div className="font-bold">✓ Confirmed</div>
                <div className="text-[9px] text-white/60">Stored in Gmail</div>
              </div>
              <div className="p-2 rounded bg-[#0E4634] text-[#34D399] border border-[#34D399]/40">
                <div className="font-bold">✓ In Kitchen</div>
                <div className="text-[9px] text-white/60">Ghee Dosa sizzling</div>
              </div>
              <div className="p-2 rounded bg-[#041A13] text-white/80 border border-white/20">
                <div className="font-bold">Executive Ramesh</div>
                <div className="text-[9px] text-white/50">Dispatched</div>
              </div>
              <div className="p-2 rounded bg-[#041A13] text-white/40 border border-white/10">
                <div className="font-bold">Delivered</div>
                <div className="text-[9px] text-white/40">Hot at door</div>
              </div>
            </div>
          </div>

          {/* Google Storage Guarantee Footer */}
          <div className="text-center pt-2 pb-1 border-t border-white/10 text-[11px] text-[#A0B3A6] flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#34D399]" />
            <span>
              This bill is saved securely and exclusively to your Google Account (<strong>{customer.email}</strong>).
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={handlePrint}
              className="w-full sm:flex-1 py-3 rounded-full font-bold text-xs uppercase tracking-wider bg-white text-[#041A13] hover:bg-[#F0FDF4] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <Printer className="w-4 h-4 text-[#041A13]" />
              <span>Print Tax Invoice & Bill</span>
            </button>
            <button
              onClick={() => setIsBillOpen(false)}
              className="w-full sm:w-auto px-6 py-3 rounded-full font-semibold text-xs border border-white/25 text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              Close Bill
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BillModal;
