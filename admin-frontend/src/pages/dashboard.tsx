import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, gql } from '@apollo/client';

const GET_VENUES = gql`
  query { venues { venueId name suburb capacity hourlyPrice active featured userId vendorEmail } }
`;
const GET_VENDORS = gql`
  query { vendors { userId email } }
`;
const GET_REPORTS = gql`
  query {
    topVenues { venueId name bookingCount popularDay popularTimeSlot }
    topApplicants { userId email totalApplications successfulBookings }
  }
`;
const CREATE_VENUE = gql`
  mutation CreateVenue($name:String!,$addressLine1:String!,$suburb:String!,$postcode:String!,$capacity:Int!,$hourlyPrice:Float!,$description:String!,$userId:Int!) {
    createVenue(name:$name,addressLine1:$addressLine1,suburb:$suburb,postcode:$postcode,capacity:$capacity,hourlyPrice:$hourlyPrice,description:$description,userId:$userId) { venueId }
  }
`;
const UPDATE_VENUE = gql`
  mutation UpdateVenue($venueId:Int!,$name:String,$suburb:String,$capacity:Int,$hourlyPrice:Float,$description:String,$active:Boolean) {
    updateVenue(venueId:$venueId,name:$name,suburb:$suburb,capacity:$capacity,hourlyPrice:$hourlyPrice,description:$description,active:$active) { venueId }
  }
`;
const DELETE_VENUE = gql`
  mutation DeleteVenue($venueId:Int!) { deleteVenue(venueId:$venueId) }
`;
const ASSIGN_VENDOR = gql`
  mutation AssignVendor($venueId:Int!,$userId:Int!) { assignVendor(venueId:$venueId,userId:$userId) { venueId vendorEmail } }
`;
const SET_FEATURED = gql`
  mutation SetFeatured($venueId:Int!,$featured:Boolean!) { setFeatured(venueId:$venueId,featured:$featured) { venueId featured } }
`;

type Tab = 'venues' | 'reports';

const emptyForm = { name: '', addressLine1: '', suburb: '', postcode: '', capacity: '', hourlyPrice: '', description: '', userId: '' };

export default function Dashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('venues');
  const [editVenue, setEditVenue] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [assignVenueId, setAssignVenueId] = useState<number | null>(null);
  const [assignUserId, setAssignUserId] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('admin_auth')) {
      router.push('/');
    }
  }, [router]);

  const { data: venueData, refetch: refetchVenues } = useQuery(GET_VENUES);
  const { data: vendorData } = useQuery(GET_VENDORS);
  const { data: reportData } = useQuery(GET_REPORTS);

  const [createVenue] = useMutation(CREATE_VENUE, { onCompleted: () => { refetchVenues(); setShowForm(false); setForm(emptyForm); } });
  const [updateVenue] = useMutation(UPDATE_VENUE, { onCompleted: () => { refetchVenues(); setEditVenue(null); } });
  const [deleteVenue] = useMutation(DELETE_VENUE, { onCompleted: () => refetchVenues() });
  const [assignVendor] = useMutation(ASSIGN_VENDOR, { onCompleted: () => { refetchVenues(); setAssignVenueId(null); setAssignUserId(''); } });
  const [setFeatured] = useMutation(SET_FEATURED, { onCompleted: () => refetchVenues() });

  const handleLogout = () => { localStorage.removeItem('admin_auth'); router.push('/'); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editVenue) {
      updateVenue({ variables: { venueId: editVenue.venueId, name: form.name, suburb: form.suburb, capacity: parseInt(form.capacity), hourlyPrice: parseFloat(form.hourlyPrice), description: form.description } });
    } else {
      createVenue({ variables: { name: form.name, addressLine1: form.addressLine1, suburb: form.suburb, postcode: form.postcode, capacity: parseInt(form.capacity), hourlyPrice: parseFloat(form.hourlyPrice), description: form.description, userId: parseInt(form.userId) } });
    }
  };

  const openEdit = (v: any) => {
    setEditVenue(v);
    setForm({ name: v.name, addressLine1: '', suburb: v.suburb, postcode: '', capacity: String(v.capacity), hourlyPrice: String(v.hourlyPrice), description: v.description || '', userId: String(v.userId || '') });
    setShowForm(true);
  };

  const venues = venueData?.venues || [];
  const vendors = vendorData?.vendors || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-700 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-lg font-bold">VV Admin Dashboard</h1>
        <button onClick={handleLogout} className="text-sm bg-indigo-800 hover:bg-indigo-900 px-4 py-1.5 rounded-lg">Logout</button>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-2 mb-6">
          {(['venues', 'reports'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-indigo-700 text-white' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'}`}>
              {t === 'venues' ? 'Venue Management' : 'Reports'}
            </button>
          ))}
        </div>

        {tab === 'venues' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">All Venues</h2>
              <button onClick={() => { setEditVenue(null); setForm(emptyForm); setShowForm(true); }}
                className="bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-medium px-4 py-2 rounded-lg">
                + Add Venue
              </button>
            </div>

            {showForm && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">{editVenue ? 'Edit Venue' : 'Add New Venue'}</h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                  <input placeholder="Name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  <input placeholder="Suburb *" value={form.suburb} onChange={e => setForm(p => ({ ...p, suburb: e.target.value }))} required className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  {!editVenue && <input placeholder="Address Line 1 *" value={form.addressLine1} onChange={e => setForm(p => ({ ...p, addressLine1: e.target.value }))} required className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />}
                  {!editVenue && <input placeholder="Postcode *" value={form.postcode} onChange={e => setForm(p => ({ ...p, postcode: e.target.value }))} required className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />}
                  <input type="number" placeholder="Capacity *" value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))} required className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  <input type="number" step="0.01" placeholder="Hourly Price *" value={form.hourlyPrice} onChange={e => setForm(p => ({ ...p, hourlyPrice: e.target.value }))} required className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  {!editVenue && (
                    <select value={form.userId} onChange={e => setForm(p => ({ ...p, userId: e.target.value }))} required className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
                      <option value="">Select Vendor *</option>
                      {vendors.map((v: any) => <option key={v.userId} value={v.userId}>{v.email}</option>)}
                    </select>
                  )}
                  <input placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="border border-gray-300 rounded-lg px-3 py-2 text-sm col-span-2" />
                  <div className="col-span-2 flex gap-3">
                    <button type="submit" className="bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-medium px-5 py-2 rounded-lg">{editVenue ? 'Save Changes' : 'Create Venue'}</button>
                    <button type="button" onClick={() => { setShowForm(false); setEditVenue(null); }} className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-5 py-2 rounded-lg">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {assignVenueId && (
              <div className="bg-white rounded-2xl border border-indigo-200 shadow-sm p-5">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Assign Vendor to Venue #{assignVenueId}</h3>
                <div className="flex gap-3">
                  <select value={assignUserId} onChange={e => setAssignUserId(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white flex-1">
                    <option value="">Select vendor...</option>
                    {vendors.map((v: any) => <option key={v.userId} value={v.userId}>{v.email}</option>)}
                  </select>
                  <button onClick={() => assignVendor({ variables: { venueId: assignVenueId, userId: parseInt(assignUserId) } })} disabled={!assignUserId}
                    className="bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg">Assign</button>
                  <button onClick={() => setAssignVenueId(null)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg">Cancel</button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['ID', 'Name', 'Suburb', 'Capacity', '$/hr', 'Vendor', 'Active', 'Featured', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {venues.map((v: any) => (
                    <tr key={v.venueId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500">{v.venueId}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{v.name}</td>
                      <td className="px-4 py-3 text-gray-600">{v.suburb}</td>
                      <td className="px-4 py-3 text-gray-600">{v.capacity}</td>
                      <td className="px-4 py-3 text-gray-600">${v.hourlyPrice}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{v.vendorEmail || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${v.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {v.active ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setFeatured({ variables: { venueId: v.venueId, featured: !v.featured } })}
                          className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${v.featured ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500 hover:bg-indigo-50'}`}>
                          {v.featured ? 'Featured' : 'Set Featured'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(v)} className="text-xs text-indigo-600 hover:underline">Edit</button>
                          <button onClick={() => setAssignVenueId(v.venueId)} className="text-xs text-indigo-600 hover:underline">Assign</button>
                          <button onClick={() => { if (window.confirm('Delete this venue?')) deleteVenue({ variables: { venueId: v.venueId } }); }} className="text-xs text-red-500 hover:underline">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'reports' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Top 3 Most Popular Venues</h2>
              {(reportData?.topVenues || []).length === 0 ? (
                <p className="text-gray-400 text-sm">No data available.</p>
              ) : (
                <div className="space-y-4">
                  {(reportData?.topVenues || []).map((v: any, i: number) => (
                    <div key={v.venueId} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="w-7 h-7 bg-indigo-700 text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0">{i + 1}</span>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{v.name}</p>
                        <p className="text-xs text-gray-500">{v.bookingCount} bookings</p>
                        {v.popularDay && <p className="text-xs text-indigo-600">Most popular: {v.popularDay} {v.popularTimeSlot}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Top 3 Most Active Applicants</h2>
              {(reportData?.topApplicants || []).length === 0 ? (
                <p className="text-gray-400 text-sm">No data available.</p>
              ) : (
                <div className="space-y-4">
                  {(reportData?.topApplicants || []).map((a: any, i: number) => (
                    <div key={a.userId} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="w-7 h-7 bg-indigo-700 text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0">{i + 1}</span>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{a.email}</p>
                        <p className="text-xs text-gray-500">{a.totalApplications} total applications</p>
                        <p className="text-xs text-green-600">{a.successfulBookings} successful bookings</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
