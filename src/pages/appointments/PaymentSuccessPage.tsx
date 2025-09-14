import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

import Spinner from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Invoice from './components/Invoice';
import Receipt from './components/Receipt';
import { CheckCircle, Download, Calendar } from 'lucide-react';

const PaymentSuccessPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const [loading, setLoading] = useState(true);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState<'invoice' | 'receipt' | null>(null);

  const invoiceRef = useRef<HTMLDivElement>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInvoiceData = async () => {
      if (!appointmentId) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('invoices')
          .select('*, appointment:appointments(*, doctor:profiles(*), parent:profiles(*), child:children(*)), payment:payments(*)')
          .eq('appointment_id', appointmentId)
          .single();
        if (error) throw error;
        setInvoiceData(data);
      } catch (error) {
        toast.error("Impossible de charger les détails de la transaction.");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoiceData();
  }, [appointmentId]);

  const handleDownload = async (type: 'invoice' | 'receipt') => {
    const targetRef = type === 'invoice' ? invoiceRef : receiptRef;
    if (!targetRef.current) return;
    
    setIsDownloading(type);
    toast.loading(`Génération du ${type === 'invoice' ? 'facture' : 'reçu'}...`, { id: 'pdf-toast' });
    
    try {
      const canvas = await html2canvas(targetRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`${type}-${invoiceData.id.substring(0, 8)}.pdf`);
      toast.success('Document téléchargé !', { id: 'pdf-toast' });
    } catch (error) {
      toast.error("Erreur lors de la génération du PDF.", { id: 'pdf-toast' });
      console.error(error);
    } finally {
      setIsDownloading(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full py-10"><Spinner size="lg" /></div>;
  }

  if (!invoiceData) {
    return <div className="text-center py-10">Détails de la transaction non trouvés.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-primary-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">Paiement Réussi !</h1>
            <p className="mt-2 text-lg text-gray-600">Votre rendez-vous est confirmé.</p>
            
            <div className="my-8 p-4 bg-gray-50 rounded-lg text-left">
              <h2 className="font-bold text-lg mb-2">Résumé de la transaction</h2>
              <p><strong>ID Transaction:</strong> {invoiceData.payment.reference}</p>
              <p><strong>Montant Payé:</strong> {new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF' }).format(invoiceData.amount)}</p>
              <p><strong>Date de Paiement:</strong> {format(new Date(invoiceData.payment.paid_at), 'd MMMM yyyy, HH:mm', { locale: fr })}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => handleDownload('invoice')} isLoading={isDownloading === 'invoice'}>
                <Download className="mr-2 h-5 w-5" />
                Télécharger la Facture
              </Button>
              <Button onClick={() => handleDownload('receipt')} isLoading={isDownloading === 'receipt'} variant="secondary">
                <Download className="mr-2 h-5 w-5" />
                Télécharger le Reçu
              </Button>
            </div>
            
            <div className="mt-8">
              <Link to="/appointments">
                <Button variant="secondary">
                  <Calendar className="mr-2 h-5 w-5" />
                  Voir mes rendez-vous
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Hidden components for PDF generation */}
      <div className="absolute -left-[9999px] top-0 w-[210mm]">
        <div ref={invoiceRef}>
          <Invoice data={invoiceData} />
        </div>
        <div ref={receiptRef}>
          <Receipt data={invoiceData} />
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
