import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Phone, ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FaizanNazarPage() {
  const { t, language } = useLanguage();

  return (
    <div className="max-w-5xl mx-auto py-8">
      <Link 
        to="/" 
        className="inline-flex items-center space-x-2 space-x-reverse text-emerald-600 hover:text-emerald-800 font-medium mb-8"
      >
        {language === 'en' ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
        <span>{t('Back to Home', 'واپس ہوم پر')}</span>
      </Link>

      <h1 className="text-4xl font-bold font-urdu text-emerald-900 border-b-2 border-gold-400 pb-4 mb-12 text-center">
        {t('Faizan-e-Nazar', 'فیضان نظر')}
      </h1>

      <div className="space-y-12">
        {/* Supervisor Profile */}
        <section className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden ring-1 ring-black/5">
          <div className="bg-emerald-50 px-8 py-5 border-b border-emerald-100 flex items-center justify-between">
            <h2 className="text-2xl font-bold font-urdu text-emerald-800">
              {t('Supervisor', 'زیر نگرانی')}
            </h2>
          </div>
          <div className="p-8">
            <h3 className="text-3xl font-bold text-gray-900 font-urdu mb-2">
              {t('Qari Ghulam Mujtaba Barvi (Gujjar Pir Sarkar)', 'قاری غلام مجتبیٰ باروی المعروف گجر پیر سرکار')}
            </h3>
            <div className="inline-block bg-gold-400/20 text-gold-600 px-3 py-1 rounded-full text-sm font-semibold tracking-wider mb-6">
              {t('Islamic Scholar, Imam & Khateeb', 'اسلامی سکالر، خطیب و امام')}
            </div>
            
            <div className="prose max-w-none text-gray-700 font-urdu leading-relaxed space-y-4 text-lg">
              {language === 'en' ? (
                <>
                  <p>Qari Ghulam Mujtaba Barvi, widely known as Gujjar Pir Sarkar, is a respected Islamic scholar, preacher, and religious leader. He is currently serving as the Imam and Khateeb of Jamia Masjid Ahl-e-Sunnat Wal Jamaat, Chak No. 68, Jaranwala.</p>
                  <p>He is the younger brother of Allama Maulana Qari Ghulam Mustafa Barvi. Throughout his religious career, he has rendered valuable services in the field of Imamat and Khitabat, including:</p>
                  <ul className="list-disc list-inside ml-4 space-y-2 text-gray-800">
                    <li>10 years as Imam and Khateeb in Gatt Wala</li>
                    <li>8 years as Imam and Khateeb in Nalay Wala</li>
                    <li>Currently serving as Imam and Khateeb at Jamia Masjid Ahl-e-Sunnat Wal Jamaat, Chak No. 68, Jaranwala</li>
                  </ul>
                  <p>He belongs to the Barvi spiritual lineage and is a devoted disciple of Khawaja Khawajgan Hazrat Sahibzada Hassan Al-Barvi, the Sajjada Nasheen of Darbar-e-Aliya Pir Baro, District Layyah.</p>
                  <p className="italic text-emerald-700 bg-emerald-50 p-4 rounded-lg mt-4 border-l-4 border-emerald-500">"Dedicated to the service of Islam, the propagation of Ahl-e-Sunnat teachings, and the spiritual guidance of the Muslim community."</p>
                </>
              ) : (
                <>
                  <p>قاری غلام مجتبیٰ باروی المعروف گجر پیر سرکار ایک معروف اسلامی سکالر، خطیب اور داعیِ اسلام ہیں۔ آپ اس وقت جامع مسجد اہلِ سنت والجماعت 68 چک جڑانوالہ میں امامت و خطابت کے فرائض سرانجام دے رہے ہیں۔</p>
                  <p>آپ حضرت علامہ مولانا قاری غلام مصطفیٰ باروی صاحب کے چھوٹے بھائی ہیں۔ آپ نے دینی خدمات کے میدان میں طویل عرصہ گزارا، جن میں:</p>
                  <ul className="list-disc list-inside mr-4 space-y-2 text-gray-800">
                    <li>10 سال گٹ والا میں امامت و خطابت</li>
                    <li>8 سال نلے والا میں امامت و خطابت</li>
                    <li>اور اب جامع مسجد اہلِ سنت والجماعت 68 چک جڑانوالہ میں امامت و خطابت شامل ہیں۔</li>
                  </ul>
                  <p>آپ کا روحانی سلسلہ باروی سے منسلک ہے، جبکہ آپ کے پیر و مرشد خواجہ خواجگان حضرت صاحبزادہ حسن الباروی صاحب ہیں، جو سجادہ نشین دربارِ عالیہ پیر بارو، ضلع لیہ ہیں۔</p>
                </>
              )}
            </div>

            <div className="mt-8 flex items-center space-x-3 space-x-reverse text-emerald-700 bg-emerald-50/50 p-4 rounded-xl w-fit">
              <Phone className="w-6 h-6" />
              <div className="font-semibold" dir="ltr">+92 305 6479292</div>
            </div>
          </div>
        </section>

        {/* Teacher Profile */}
        <section className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden ring-1 ring-black/5">
          <div className="bg-emerald-50 px-8 py-5 border-b border-emerald-100 flex items-center justify-between">
            <h2 className="text-2xl font-bold font-urdu text-emerald-800">
              {t('Teacher', 'معلم')}
            </h2>
          </div>
          <div className="p-8">
            <h3 className="text-3xl font-bold text-gray-900 font-urdu mb-2">
              {t('Allama Maulana Hafiz Muhammad Usman Barvi', 'حضرت علامہ مولانا حافظ محمد عثمان باروی')}
            </h3>
            <div className="inline-block bg-gold-400/20 text-gold-600 px-3 py-1 rounded-full text-sm font-semibold tracking-wider mb-6">
              {t('Hafiz-e-Quran | Islamic Scholar | Naat Khawan & Renowned Orator', 'حافظِ قرآن، عالمِ دین، نعت خواں و خطیبِ پاکستان')}
            </div>
            
            <div className="prose max-w-none text-gray-700 font-urdu leading-relaxed space-y-4 text-lg">
              {language === 'en' ? (
                <>
                  <p>Allama Maulana Hafiz Muhammad Usman Barvi is a distinguished Islamic scholar, Hafiz-e-Quran, renowned Naat Khawan, and a powerful public speaker.</p>
                  <p>He completed the memorization of the Holy Quran at Madrasah Ma'arif-ul-Quran, Jamia Masjid Ayesha Siddiqah (RA), an institution established and supervised by Allama Maulana Hafiz & Qari Ghulam Mustafa Barvi Shaheed (RA).</p>
                  <p>He began his religious and preaching services from Chak No. 109 GB Bajajanwala, Jaranwala, where he started his journey in serving Islam and spreading religious knowledge.</p>
                  <p>By the grace of Allah Almighty, he has become a well-known Naat Khawan, Khateeb of Pakistan, and an inspiring orator. He actively participates in religious gatherings, conferences, and spiritual events across Pakistan, delivering speeches and reciting Naat in praise of the Holy Prophet Muhammad ﷺ.</p>
                  <p>His speeches are known for their deep knowledge, devotion to the Prophet ﷺ, promotion of Ahl-e-Sunnah teachings, and guidance for moral and spiritual reform.</p>
                  <p className="italic text-emerald-700 bg-emerald-50 p-4 rounded-lg mt-4 border-l-4 border-emerald-500">"Serving Islam through knowledge, preaching, and the love of the Holy Prophet Muhammad ﷺ."</p>
                </>
              ) : (
                <>
                  <p>حضرت علامہ مولانا حافظ محمد عثمان باروی صاحب ایک ممتاز عالمِ دین، حافظِ قرآن، نعت خواں اور شعلہ بیان خطیب ہیں۔ آپ نے حفظِ قرآن کی سعادت مدرسہ معارف القرآن، جامع مسجد عائشہ صدیقہ رضی اللہ تعالیٰ عنہا میں حاصل کی، جو حضرت علامہ مولانا حافظ و قاری غلام مصطفیٰ باروی شہید رحمۃ اللہ علیہ کی زیرِ سرپرستی قائم تھا۔</p>
                  <p>آپ نے اپنی دینی و تبلیغی خدمات کا آغاز چک نمبر 109 گ ب بجاجانوالہ، جڑانوالہ سے کیا اور اسی ادارے سے دینِ اسلام کی خدمت کا سفر شروع کیا۔</p>
                  <p>اللہ تعالیٰ کے فضل و کرم سے آپ ایک معروف نعت خواں، خطیبِ پاکستان اور شعلہ بیان مقرر ہیں۔ آپ ملک بھر میں مختلف دینی، روحانی اور اصلاحی اجتماعات میں شرکت فرما کر نعت خوانی، خطابت اور دعوتِ دین کے فرائض انجام دیتے ہیں۔</p>
                  <p>آپ کی خطابت میں علم، محبتِ رسول ﷺ، عقیدۂ اہلِ سنت اور اصلاحِ معاشرہ کا حسین امتزاج پایا جاتا ہے، جس کی بدولت آپ کو عوام و خواص میں قدر و منزلت حاصل ہے۔</p>
                </>
              )}
            </div>

            <div className="mt-8 flex items-center space-x-3 space-x-reverse text-emerald-700 bg-emerald-50/50 p-4 rounded-xl w-fit">
              <Phone className="w-6 h-6" />
              <div className="font-semibold" dir="ltr">+92 306 5253184</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
